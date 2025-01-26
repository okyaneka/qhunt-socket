import { Server } from "socket.io";
import env from "~/configs/env";
import mongoose from "./plugins/mongoose";
import sockets from "./sockets";
import server from "./configs/server";
import log from "./helpers/log";
import { socket } from "./helpers";

mongoose();

const httpServer = server.create();

const app = new Server(httpServer, server.options);

app.on("connection", socket.listen());

sockets(app);

httpServer.listen(env.PORT, () => {
  console.log("\n", `Server is running at http://localhost:${env.PORT}`);
});
