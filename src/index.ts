import { createServer } from "http";
import { Server } from "socket.io";
import env from "~/configs/env";
import LogMiddleware from "./middlewares/LogMiddleware";

const httpServer = createServer((req, res) => {
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

const io = new Server(httpServer, {
  /* options */
});

io.use(LogMiddleware);

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(env.PORT, () => {
  console.log("\n", `Server is running at http://localhost:${env.PORT}`);
});
