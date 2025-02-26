import dayjs from "dayjs";
import { UserChallenge, UserPhotoHunt } from "qhunt-lib";
import { CHALLENGE_TYPES, USER_CHALLENGE_STATUS } from "qhunt-lib/constants";
import { UserChallengeService, UserPhotoHuntService } from "qhunt-lib/services";
import { Socket } from "socket.io";
import { SocketManager } from "~/helpers/socket";

interface CheckResponse {
  status: string;
  message: string;
}

class PhotohuntSocket extends SocketManager {
  private id!: string;
  private TID!: string;
  private challenge!: UserChallenge;
  private items!: UserPhotoHunt[];
  private timer!: number;
  private interval!: NodeJS.Timeout | null;

  constructor(socket: Socket) {
    super(socket);
    this.initiate();
  }

  private destructor() {}

  private initiate = this.safeHandler(async () => {
    const socket = this.socket;

    const id = socket.handshake.query.id as string;
    if (!id) throw new Error("invalid id");

    const TID = socket.auth?.code;
    if (!TID) throw new Error("invalid auth");

    this.id = id;
    this.TID = TID;

    await this.setChallenge("init");
    await this.setTimer();
    await this.setInterval();
    await this.setListeners();
  });

  private emitResults() {
    const { results, status } = this.challenge;
    this.socket.emit(
      "setResults",
      results,
      status === USER_CHALLENGE_STATUS.Completed
    );
  }

  private emitItems() {
    this.socket.emit("setItems", this.items);
  }

  private emitTimer() {
    this.socket.emit("setTimer", this.timer);
  }

  private setChallenge = this.safeHandler(
    async (state: "init" | "detail" | "finish" = "detail") => {
      const { Discovered, OnGoing, Completed } = USER_CHALLENGE_STATUS;
      const VALID_STATUS: string[] = [Discovered, OnGoing, Completed];

      if (state === "finish" && this.interval != null) {
        clearInterval(this.interval);
        this.interval = null;
      }

      const action =
        state === "detail"
          ? UserChallengeService.detail
          : UserChallengeService.submit;
      const challenge = await action(
        this.id,
        this.TID,
        undefined,
        state === "finish"
      );

      if (!VALID_STATUS.includes(challenge.status))
        throw new Error(`challenge status must in ${VALID_STATUS.join(", ")}`);

      if (challenge.settings.type !== CHALLENGE_TYPES.PhotoHunt)
        throw new Error("challenge type is not photohunt");

      this.challenge = challenge;
      this.emitResults();
      this.setItems();
    }
  );

  private setItems = this.safeHandler(async () => {
    const items = await UserPhotoHuntService.details(
      this.challenge.contents,
      this.TID
    );

    this.items = items;
    this.emitItems();
  });

  private setTimer = this.safeHandler(() => {
    const { results, settings } = this.challenge;
    const timer = settings.duration - dayjs().diff(results?.startAt, "seconds");

    this.timer = Math.max(timer, 0);

    this.emitTimer();
  });

  private async setInterval() {
    if (this.interval !== null) clearInterval(this.interval);
    const doIt = () => {
      if (this.timer === 0) return this.setChallenge("finish");

      this.timer--;
      this.setTimer();
    };
    doIt();
    this.interval = setInterval(doIt, 1e3);
  }

  private async setListeners() {
    this.socket.on("check", this.onCheck.bind(this));
  }

  private onCheck = this.safeHandler(
    async (code: string, callback: (res: CheckResponse) => void) => {
      const item = await UserPhotoHuntService.submit(
        this.id,
        this.TID,
        code
      ).catch((err) => {
        callback({ message: err.message, status: "failed" });
        return undefined;
      });

      if (item?.results) {
        const { results } = item;
        callback({ message: results.feedback || "", status: "success" });
        this.setChallenge();
      }
    }
  );

  protected onDisconnect() {}
}

export default (socket: Socket) => new PhotohuntSocket(socket);
