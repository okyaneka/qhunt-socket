import { Server } from "socket.io";
import mongoose from "./plugins/mongoose";
import sockets from "./sockets";
import server from "./configs/server";
import { socket } from "./helpers";
import env from "./configs/env";
import "./plugins/redis";

mongoose();

const httpServer = server.create();

const app = new Server(httpServer, server.options);

app.on("connection", socket.listen());

sockets(app);

httpServer.listen(env.PORT, () => {
  console.log(`\nServer is running at http://localhost:${env.PORT}`);
});
