import { LeaderboardService } from "qhunt-lib/services";
import { LeaderboardParamsValidator } from "qhunt-lib/validators/leaderboard";
import { event, log, socket } from "~/helpers";
import { EVENTS } from "~/helpers/event";
import useRedis from "~/plugins/redis";

// const redis = useRedis();

// redis.subscribe("leaderboard");

const LeaderboardSocket = socket.listen(async (socket) => {
  const auth = socket.auth;
  const { mode, stageId } = await LeaderboardParamsValidator.validateAsync(
    socket.handshake.query,
    { allowUnknown: true }
  );

  if (!auth) throw new Error("invalid auth");

  const setRanks = async (id?: string) => {
    if (id && id !== stageId) return;
    const args = [
      stageId,
      auth.code,
      mode === "ranks" ? 100 : undefined,
    ] as const;
    const data = await LeaderboardService.stage(...args).catch(
      (err: Error) => err
    );
    if (data instanceof Error) {
      log.error(socket, data);
      return socket.emit("error", data.message);
    }
    socket.emit("setData", data);
  };

  /**
   * events
   * 1. set data
   */

  event.on(EVENTS.ScoreChanged, setRanks);

  socket.on("disconnect", () => {
    event.removeListener(EVENTS.ScoreChanged, setRanks);
  });

  setRanks();
});

export default LeaderboardSocket;
