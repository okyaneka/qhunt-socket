import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: Number(process.env.PORT) || 1234,

  MONGO_URI: process.env.MONGO_URI || "",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "",

  JWT_SECRET: process.env.JWT_SECRET || "",

  APP_URL: process.env.APP_URL || "",
} as const;

export default env;
