import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import "server-only";

import { prisma } from "@/lib/prisma";

// Регистрация разрешена только для локального
// первоначального создания администратора.
const bootstrapEnabled =
  process.env.NODE_ENV === "development" && process.env.ADMIN_BOOTSTRAP === "only-local-script";

// Только эти операции могут создать сессию,
// отмеченную как прошедшую второй фактор.
// Важно проверить работу хуков на Preview.
const mfaVerificationPaths = new Set(["/two-factor/verify-totp", "/two-factor/verify-backup-code"]);

export const auth = betterAuth({
  appName: "Слава Ніконоров",

  // PostgreSQL через Prisma 7
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Секрет и адрес приложения
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // Авторизация по email и паролю
  emailAndPassword: {
    enabled: true,

    // Публичной регистрации нет
    disableSignUp: !bootstrapEnabled,

    minPasswordLength: 14,
    maxPasswordLength: 128,
  },

  // Роли пользователей
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",

        // Роль нельзя назначить через клиентский API
        input: false,
      },
    },
  },

  // Настройки сессии
  session: {
    // Максимум 8 часов
    expiresIn: 60 * 60 * 8,

    // Обновление срока жизни каждые 30 минут
    updateAge: 60 * 30,

    additionalFields: {
      mfaVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,

        // Клиент не может установить этот флаг
        input: false,
      },
    },
  },

  // Серверная отметка о проверке 2FA
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          const mfaVerified = ctx?.path != null && mfaVerificationPaths.has(ctx.path);

          return {
            data: {
              ...session,
              mfaVerified,
            },
          };
        },
      },
    },
  },

  // Защита от перебора паролей и кодов
  rateLimit: {
    enabled: true,

    // Хранилище в PostgreSQL
    storage: "database",

    window: 60,
    max: 80,

    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },

      "/two-factor/*": {
        window: 60,
        max: 6,
      },
    },
  },

  // Двухфакторная аутентификация
  plugins: [
    twoFactor({
      issuer: "Слава Ніконоров",

      // Для активации нужно подтвердить код
      skipVerificationOnEnable: false,

      // Шестизначный код, обновление каждые 30 секунд
      totpOptions: {
        digits: 6,
        period: 30,
      },

      // Резервные коды восстановления
      backupCodeOptions: {
        amount: 10,
        length: 12,
      },
    }),
  ],
});
