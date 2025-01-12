import log from "../log";
import { ConnectionHandler } from "../types";

const listen = (ops?: ConnectionHandler): ConnectionHandler => {
  return (socket) => {
    log.info(socket, "connect");

    socket.onAny((event, ...args) => {
      log.info(socket, `${event} ${JSON.stringify(args)}`);
    });

    socket.on("disconnect", (reason) => {
      log.info(socket, `disconnect: ${reason}`);
    });

    socket.on("disconnecting", (reason) => {
      log.info(socket, `disconnecting: ${reason}`);
    });

    ops && ops(socket);
  };
};

const socket = { listen } as const;

export default socket;
