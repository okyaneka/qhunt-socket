import { Server } from "socket.io";
import { AuthMiddleware } from "~/middlewares";
import TriviaSocket from "./trivia";
import LeaderboardSocket from "./leaderboard";
import PhotohuntSocket from "./photohunt";

const socketNamespaces = [
  { namespace: "/leaderboard", handler: LeaderboardSocket },
  { namespace: "/trivia", handler: TriviaSocket },
  { namespace: "/photohunt", handler: PhotohuntSocket },
];

const sockets = (app: Server) => {
  socketNamespaces.forEach(({ namespace, handler }) => {
    app.of(namespace).use(AuthMiddleware).on("connection", handler);
  });
};

export default sockets;
