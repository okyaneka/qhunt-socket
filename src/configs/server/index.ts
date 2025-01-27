import { createServer } from "http";
import { ServerOptions } from "socket.io";
import { response } from "qhunt-lib/helpers";
import env from "../env";

export const create = () =>
  createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(response.success("QHunt Socket")));
  });

export const options: Partial<ServerOptions> = {
  cors: {
    origin: env.APP_URL,
    credentials: true,
  },
  path: "/socket",
};

const server = { create, options } as const;

export default server;
