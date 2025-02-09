import { Server } from "socket.io";
import { AuthMiddleware } from "~/middlewares";
import TriviaSocket from "./trivia";

const sockets = (app: Server) => {
  app.of("/trivia").use(AuthMiddleware).on("connection", TriviaSocket);
};

export default sockets;
