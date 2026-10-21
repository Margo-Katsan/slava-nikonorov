#!/usr/bin/env node
/**
 * Read-only checklist for the Slava Nikonorov portfolio.
 * Run from the project root: node scripts/audit-portfolio.mjs
 * No network calls, secrets, database writes or data migrations.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const file = (relative) => {
  const path = join(cwd, relative);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
};
const has = (relative) => existsSync(join(cwd, relative));
const results = [];
const add = (status, title, detail) => results.push({ status, title, detail });
const check = (ok, title, ifNot) => add(ok ? "OK" : "ПРОВЕРИТЬ", title, ok ? "" : ifNot);

const section = "app/(site)/[section]/page.tsx";
const route = file(section);
check(has(section), "Публичный маршрут [section]", "Нет файла публичного маршрута.");
if (route) {
  check(
    route.includes("getSectionFromDb"),
    "Материалы разделов из Neon",
    "В маршруте не обнаружен getSectionFromDb().",
  );
  check(
    route.includes("WritingPublicBoard"),
    "Полные тексты «Я пишу»",
    "Проверь использование WritingPublicBoard вместо универсального MediaGrid.",
  );
  check(
    /force-dynamic|revalidate\s*=/.test(route),
    "Обновление динамических страниц",
    "Проверь cache/revalidate для CMS-страниц.",
  );
}

const contentDb = file("lib/content-db.ts");
check(
  contentDb.includes("getPublishedCreativeItems"),
  "Связь lib/content-db.ts с базой",
  "Нужен запрос к опубликованным CreativeItem.",
);
check(
  contentDb.includes("categoryGroupIndex"),
  "Группы кино / рисунков / фотографий",
  "Проверь группировку по categoryTag.",
);
check(
  contentDb.includes("cloudinaryVideoPoster") && contentDb.includes('resourceType === "video"'),
  "Видео Cloudinary на публичной стороне",
  "Проверь poster и video для медиафайлов типа video.",
);

const creativePublic = file("lib/creative/public.ts");
check(
  /published:\s*true/.test(creativePublic),
  "Публично только опубликованное",
  "Запрос должен фильтровать published: true.",
);
check(
  creativePublic.includes("sortOrder"),
  "Порядок Drag & Drop",
  "Запрос должен сортировать по sortOrder.",
);

const board = file("components/CinemaEvidenceBoard.tsx");
if (board) {
  const matches = board.match(/<TornLabel>ШОУРІЛ І ВІЗИТКА<\/TornLabel>/g) ?? [];
  check(
    matches.length <= 1,
    "Заголовок киноархива не дублируется",
    "Удалить второй подряд <TornLabel>.",
  );
}

const act = file("app/admin/creative-actions.ts");
check(
  act.includes("/kino") && act.includes("/ya-pyshu") && act.includes("revalidatePath"),
  "Правильные пути revalidatePath",
  "Публичные URL на украинском отличаются от admin slug.",
);
check(
  act.includes("permitsVideo") || /slug === "cinema"[\s\S]*media\.resourceType/.test(act),
  "Сохранение видео в кино",
  "Сервер не должен отклонять video для cinema и my-cinema.",
);

const cfg = file("next.config.ts") || file("next.config.js") || file("next.config.mjs");
check(
  cfg.includes("res.cloudinary.com"),
  "Next/Image разрешает Cloudinary",
  "Добавь домен в images.remotePatterns.",
);

const auth = file("lib/auth.ts");
if (auth) {
  check(
    !auth.includes('ADMIN_BOOTSTRAP === "production-one-time"'),
    "Временное разрешение регистрации выключено",
    "Удалить production bootstrap из lib/auth.ts после создания администратора.",
  );
  if (auth.includes("mfaVerified")) {
    add(
      "РУЧНАЯ ПРОВЕРКА",
      "Безопасность 2FA",
      "Проверь, что mfaVerified устанавливается только после фактической проверки TOTP, а не по совпадению URL запроса.",
    );
  }
}

const ignore = file(".gitignore");
for (const name of [".env.local", ".env.production.migrate", ".env.production.bootstrap"]) {
  // Git check-ignore is authoritative; wildcard patterns count as protected as well.
  const protectedByPattern = ignore.split(/\r?\n/).some((line) => {
    const rule = line.trim();
    return (
      rule === name ||
      rule === ".env*" ||
      rule === ".env.*" ||
      (rule === ".env.production.*" && name.startsWith(".env.production."))
    );
  });
  check(
    protectedByPattern,
    `${name} исключён из Git`,
    "Проверь git check-ignore и git ls-files; секреты не должны попасть в Git.",
  );
}

for (const routeName of [
  "cinema",
  "theatre",
  "my-cinema",
  "painting",
  "writing",
  "gallery",
  "contacts",
  "settings",
]) {
  check(
    has(`app/admin/${routeName}/page.tsx`),
    `Админка: ${routeName}`,
    "Проверь, установлена ли соответствующая страница.",
  );
}

add(
  "РУЧНАЯ ПРОВЕРКА",
  "Главная и интро",
  "Проверь Status, BioProfile, SiteContacts и 11 голов через данные Neon, а не демо-константы.",
);
add(
  "РУЧНАЯ ПРОВЕРКА",
  "Neon Development vs main",
  "Ветка, строки подключения, опубликованные записи и пользователи отличаются. Скрипт не читает окружение и базу.",
);
add(
  "РУЧНАЯ ПРОВЕРКА",
  "Production 2FA",
  "Удостоверься, что администратор настроил TOTP именно на Production перед запуском.",
);

const counts = { OK: 0, ПРОВЕРИТЬ: 0, "РУЧНАЯ ПРОВЕРКА": 0 };
for (const entry of results) {
  counts[entry.status]++;
  const tag = entry.status === "OK" ? "✓" : entry.status === "ПРОВЕРИТЬ" ? "!" : "?";
  console.log(`${tag} [${entry.status}] ${entry.title}`);
  if (entry.detail) console.log(`    ${entry.detail}`);
}
console.log(
  `\nИтог: ${counts.OK} OK, ${counts["ПРОВЕРИТЬ"]} требуют внимания, ${counts["РУЧНАЯ ПРОВЕРКА"]} ручных проверок.`,
);
process.exitCode = counts["ПРОВЕРИТЬ"] ? 1 : 0;
