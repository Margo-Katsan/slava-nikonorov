import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

const envFile = process.env.PRISMA_ENV_FILE;

config({
  path: envFile ?? ".env.local",
  override: Boolean(envFile),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});
