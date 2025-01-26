import { Socket } from "socket.io";
import path from "path";
import dayjs from "dayjs";
import fs from "fs";

const logPath = path.join(
  __dirname,
  `../../../logs/access_${dayjs().format("YY-MM-DD")}.log`
);
const logsDir = path.dirname(logPath);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const write = (
  type: "INFO" | "DEBUG" | "ERROR",
  message: string = ""
) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${type} ${message}`.trim();

  fs.appendFile(logPath, logMessage + "\n", (err) => {
    if (err) console.error("Failed to write log to file", err);
  });

  console.log(logMessage);
};

export const info = (socket: Socket, message: string = "") => {
  const namespace = socket.nsp.name;
  const id = socket.id;
  return write("INFO", `[${id}] ${namespace}:${message}`.trim());
};

export const debug = (socket: Socket, message: string = "") => {
  const namespace = socket.nsp.name;
  const id = socket.id;
  return write("DEBUG", `[${id}] ${namespace}:${message}`.trim());
};

export const error = (socket: Socket, message: string = "") => {
  const namespace = socket.nsp.name;
  const id = socket.id;
  return write("ERROR", `[${id}] ${namespace}:${message}`.trim());
};

const log = { info, debug, error } as const;

export default log;
