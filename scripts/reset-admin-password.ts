import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Only development is allowed.");
  }

  if (process.env.BOOTSTRAP_DB_CONFIRMED !== "development") {
    throw new Error("Confirm that the database is development.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing.");
  }

  if (password.length < 14 || password.length > 128) {
    throw new Error("Password must contain 14–128 characters.");
  }

  const { prisma } = await import("../lib/prisma");

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "admin") {
      throw new Error("Administrator with this email was not found.");
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (!account) {
      throw new Error("Password-based account was not found.");
    }

    // Используем алгоритм Better Auth
    const hashedPassword = await hashPassword(password);

    // Обновляем пароль и удаляем старые сессии
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });
    });

    console.log("Administrator password updated.");
    console.log("All previous sessions revoked.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Password reset failed:", error);
  process.exitCode = 1;
});
