import path from "path";
import fs from "fs";
import { SocketHandler } from "~/helpers";

const logPath = path.join(__dirname, "../../../logs/access.log");

const logsDir = path.dirname(logPath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const writeLog = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFile(logPath, logMessage + "\n", (err) => {
    if (err) {
      console.error("Failed to write log to file", err);
    }
  });
};

const LogMiddleware: SocketHandler = (socket, next) => {
  const namespace = socket.nsp.name;
  const id = socket.id;

  writeLog(`${id}`);

  next();
};

export default LogMiddleware;
