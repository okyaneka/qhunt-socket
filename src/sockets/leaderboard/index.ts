import { LeaderboardService } from "qhunt-lib/services";
import { log, socket } from "~/helpers";
import { EVENTS } from "~/helpers/event";
import redis from "~/plugins/redis";

// ENHANCE ME: ganti pakai class socket manager
const LeaderboardSocket = socket.listen(async (socket) => {
  const auth = socket.auth;

  const { mode, stageId } = socket.handshake.query;

  if (typeof stageId !== "string") throw new Error("stage id invalid");
  if (!auth) throw new Error("invalid auth");

  const setRanks = async (id?: string) => {
    if (id && id !== stageId) return;

    const data = await LeaderboardService.stage(
      stageId,
      auth.code,
      mode === "ranks" ? 100 : undefined
    ).catch((err: Error) => err);

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

  const listens = await Promise.all([
    redis.sub("update-user", () => {
      console.log("p");
      setRanks();
    }),
    redis.sub<string>("leaderboard", (value) => {
      console.log(stageId, value);
      stageId === value && setRanks();
    }),
  ]);

  socket.on("disconnect", () => {
    listens.forEach((listen) => listen && listen());
  });

  setRanks();
});

export default LeaderboardSocket;
