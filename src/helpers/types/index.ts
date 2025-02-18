import { ExtendedError, Socket } from "socket.io";

export type Handler<T extends any[] = any[]> = (
  ...args: T
) => Promise<void> | void;

export type ConnectionHandler = (socket: Socket) => Promise<void>;

export type SocketHandler = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => void;
