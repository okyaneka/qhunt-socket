import { ExtendedError, Socket } from "socket.io";

export type ConnectionHandler = (socket: Socket) => void;

export type SocketHandler = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => void;
