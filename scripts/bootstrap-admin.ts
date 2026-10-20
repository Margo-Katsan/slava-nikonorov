import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  // Только локальная разработка
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Admin bootstrap is allowed only in development.");
  }

  // Подтверждение тестовой базы
  if (process.env.BOOTSTRAP_DB_CONFIRMED !== "development") {
    throw new Error("Confirm the development database first.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 14) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (14+ characters).");
  }

  if (!process.env.POSTGRES_PRISMA_URL || !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error("PostgreSQL environment variables are missing.");
  }

  // Разрешаем регистрацию только этому процессу
  process.env.ADMIN_BOOTSTRAP = "only-local-script";

  // Динамические импорты после загрузки .env
  const { prisma } = await import("../lib/prisma");
  const { auth } = await import("../lib/auth");

  try {
    // Проверка существующих пользователей
    const count = await prisma.user.count();

    if (count !== 0) {
      throw new Error("Users already exist. Admin creation cancelled.");
    }

    // Создаём администратора
    const created = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Слава Ніконоров",
      },
    });

    if (!created?.user?.id) {
      throw new Error("Admin creation failed.");
    }

    // Устанавливаем роль администратора
    await prisma.user.update({
      where: {
        id: created.user.id,
      },
      data: {
        role: "admin",
        emailVerified: true,
      },
    });

    console.log("Administrator created successfully.");
    console.log("Sign in and configure TOTP immediately.");
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем без top-level await
main().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exitCode = 1;
});
