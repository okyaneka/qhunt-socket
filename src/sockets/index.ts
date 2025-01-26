import { Server } from "socket.io";
import ChallengeSocket from "./ChallengeSocket";
import { AuthMiddleware } from "~/middlewares";

const sockets = (app: Server) => {
  app.of("/challenge").use(AuthMiddleware).on("connection", ChallengeSocket);
};

export default sockets;
