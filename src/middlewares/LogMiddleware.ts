import path from "path";
import fs from "fs";
import { ExtendedError, Socket } from "socket.io";
import { SocketHandler } from ".";

const logPath = path.join(__dirname, "../../../logs/access.log");

const logsDir = path.dirname(logPath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LogMiddleware: SocketHandler = (socket, next) => {
  const timestamp = new Date().toISOString();
  const method = ""; //req.method;
  const path = ""; //req.path;

  const logMessage = `[${timestamp}] ${method}: ${path}`;
  console.log(socket.data);
  console.log(logMessage);

  fs.appendFile(logPath, logMessage + "\n", (err) => {
    if (err) {
      console.error("Failed to write log to file", err);
    }
  });

  next();
};

export default LogMiddleware;
