import { createServer } from "http";
import { Server } from "socket.io";
import env from "~/configs/env";
import mongoose from "./plugins/mongoose";
import { AuthMiddleware, LogMiddleware } from "./middlewares";
import sockets from "./sockets";

mongoose();

const httpServer = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Ganti dengan origin yang diizinkan
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, TID");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Jika kamu ingin mengizinkan kredensial

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      code: 200,
      message: "success",
      data: "QHunt Socket",
      error: {},
    })
  );
});

const app = new Server(httpServer, {
  connectionStateRecovery: {},
  cors: {
    origin: /^http:\/\/localhost:\d+$/,
    allowedHeaders: ["tid"],
    credentials: true,
  },
});

app.use(LogMiddleware);

sockets(app);

app
  .of("/test")
  .use(AuthMiddleware)
  .on("connection", (socket) => {
    let text = "";
    console.log("connected to test");

    socket.emit("connected");

    // socket.on("asdwqe", () => {

    // });

    socket.on("disconnect", () => {
      console.log("test disconnected");
    });
  });

app.on("connection", (socket) => {
  // console.log("a user connected");
  socket.on("disconnect", () => {
    // console.log("user disconnected");
  });
});

httpServer.listen(env.PORT, () => {
  console.log("\n", `Server is running at http://localhost:${env.PORT}`);
});
