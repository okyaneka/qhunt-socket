import { Socket } from "socket.io";
import log from "../log";
import { ConnectionHandler, Handler } from "../types";

export class SocketManager {
  protected socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setListener();
  }

  private setListener() {
    const socket = this.socket;
    log.info(socket, "connect");

    socket.onAny((event, ...args) => {
      const message = args
        .map((v) => JSON.stringify(v))
        .join(" ")
        .trim();
      log.info(socket, `${event} ${message}`);
    });

    socket.on("disconnect", (reason) => {
      this.onDisconnect();
      log.info(socket, `disconnect ${reason}`);
    });

    socket.on("disconnecting", (reason) => {
      this.onDisconnecting();
      log.info(socket, `disconnecting ${reason}`);
    });

    socket.on("ping", () => {
      this.onPing();
      socket.emit("pong");
    });
  }

  protected onDisconnect() {}
  protected onDisconnecting() {}
  protected onPing() {}

  protected safeHandler<T extends any[]>(handler: Handler<T>): Handler<T> {
    return (...args: T) => {
      return Promise.resolve(handler(...args)).catch((err) => {
        const socket = this.socket;
        log.error(socket, err);
        socket.emit("error", err.message);
      });
    };
  }
}

const listen = (ops?: ConnectionHandler): ConnectionHandler => {
  return async (socket) => {
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

    if (ops !== undefined)
      ops(socket).catch((err: Error) => {
        log.error(socket, err);
        socket.emit("error", err.message);
        socket.disconnect();
      });
    // ops && ops(socket);
  };
};

const socket = { listen } as const;

export default socket;
