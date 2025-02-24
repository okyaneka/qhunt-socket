import { env } from "~/configs";
import RedisHelper, { RedisOptions } from "qhunt-lib/plugins/redis";

const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

let instance: RedisHelper;

const redis = () => {
  if (!instance) instance = new RedisHelper(options);
  return instance;
};

export default redis;
