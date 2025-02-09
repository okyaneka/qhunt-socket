import { Server } from "socket.io";
import { AuthMiddleware } from "~/middlewares";
import TriviaSocket from "./trivia";
import LeaderboardSocket from "./leaderboard";

const sockets = (app: Server) => {
  app
    .of("/leaderboard")
    .use(AuthMiddleware)
    .on("connection", LeaderboardSocket);
  app.of("/trivia").use(AuthMiddleware).on("connection", TriviaSocket);
};

export default sockets;
