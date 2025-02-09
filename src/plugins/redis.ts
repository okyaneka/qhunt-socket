import Redis from "ioredis";
import { env } from "~/configs";

let instance: Redis;

const useRedis = () => {
  if (!instance) {
    instance = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    instance.on("connect", () => console.log("Redis connected successfully!"));
    instance.on("error", (err) => console.error("❌ Redis Error:", err));
  }
  return instance;
};

export default useRedis;
