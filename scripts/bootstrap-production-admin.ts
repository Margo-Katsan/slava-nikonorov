import { config, parse } from "dotenv";
import { readFileSync } from "node:fs";

const result = config({
  path: ".env.production.bootstrap",
  override: true,
});

if (result.error) {
  throw new Error("Cannot load Production bootstrap environment.");
}

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function main() {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Run with NODE_ENV=production.");
  }

  if (required("PRODUCTION_BOOTSTRAP_CONFIRM") !== "CREATE_ADMIN_ON_NEON_MAIN") {
    throw new Error("Production bootstrap not confirmed.");
  }

  const directUrl = new URL(required("POSTGRES_URL_NON_POOLING"));

  const pooledUrl = new URL(required("POSTGRES_PRISMA_URL"));

  const migrationEnv = parse(readFileSync(".env.production.migrate"));

  const verifiedProductionUrl = migrationEnv.POSTGRES_URL_NON_POOLING;

  if (!verifiedProductionUrl) {
    throw new Error("Production migration connection is missing.");
  }

  const expectedHost = new URL(verifiedProductionUrl).hostname;

  const normalizedPoolHost = pooledUrl.hostname.replace(/-pooler(?=[.-])/, "");

  if (
    directUrl.hostname !== expectedHost ||
    normalizedPoolHost !== expectedHost ||
    directUrl.pathname !== pooledUrl.pathname ||
    directUrl.username !== pooledUrl.username
  ) {
    console.error("Database connection checks:", {
      directHostMatches: directUrl.hostname === expectedHost,

      pooledHostMatches: normalizedPoolHost === expectedHost,

      databaseMatches: directUrl.pathname === pooledUrl.pathname,

      roleMatches: directUrl.username === pooledUrl.username,
    });

    throw new Error("Database connections do not match the confirmed Neon main endpoint.");
  }

  if (
    !directUrl.hostname.endsWith(".neon.tech") ||
    !["postgres:", "postgresql:"].includes(directUrl.protocol)
  ) {
    throw new Error("Unexpected Production database endpoint.");
  }

  if (
    directUrl.searchParams.get("sslmode") === "disable" ||
    pooledUrl.searchParams.get("sslmode") === "disable"
  ) {
    throw new Error("TLS must not be disabled.");
  }

  const email = required("ADMIN_EMAIL").toLowerCase();
  const password = required("ADMIN_PASSWORD");

  required("BETTER_AUTH_SECRET");
  const authUrl = required("BETTER_AUTH_URL");

  if (authUrl !== "https://slava-nikonorov.vercel.app") {
    throw new Error("Unexpected Better Auth URL.");
  }

  if (password.length < 14) {
    throw new Error("Admin password must contain 14+ characters.");
  }

  // Флаг действует только в этом процессе.
  // Поддержка флага должна быть проверена в lib/auth.ts.
  process.env.ADMIN_BOOTSTRAP = "production-one-time";

  const { prisma } = await import("../lib/prisma");
  const { auth } = await import("../lib/auth");

  try {
    const count = await prisma.user.count();

    if (count !== 0) {
      throw new Error("Production already contains users. Bootstrap cancelled.");
    }

    const created = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Слава Ніконоров",
      },
    });

    if (!created?.user?.id) {
      throw new Error("Better Auth did not create an admin user.");
    }

    await prisma.user.update({
      where: { id: created.user.id },
      data: {
        role: "admin",
        emailVerified: true,
      },
    });

    console.log("Production administrator created.");
    console.log("Configure TOTP two-factor authentication next.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Bootstrap failed.");
  process.exitCode = 1;
});
