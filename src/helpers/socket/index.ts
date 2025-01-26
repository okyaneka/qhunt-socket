import log from "../log";
import { ConnectionHandler } from "../types";

const listen = (ops?: ConnectionHandler): ConnectionHandler => {
  return (socket) => {
    log.info(socket, "connect");

    socket.onAny((event, ...args) => {
      const message = args
        .map((v) => JSON.stringify(v))
        .join(" ")
        .trim();
      log.info(socket, `${event} ${message}`);
    });

    socket.on("disconnect", (reason) => {
      log.info(socket, `disconnect ${reason}`);
    });

    socket.on("disconnecting", (reason) => {
      log.info(socket, `disconnecting ${reason}`);
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });

    ops && ops(socket);
  };
};

const socket = { listen } as const;

export default socket;
