import { Server } from "socket.io";
import ChallengeSocket from "./ChallengeSocket";

const sockets = (app: Server) => {
  app.of("/challenge").on("connection", ChallengeSocket);
};

export default sockets;
