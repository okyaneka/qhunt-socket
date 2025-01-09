import { ExtendedError, Socket } from "socket.io";

export type SocketHandler = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => void;
