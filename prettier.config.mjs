/** @type {import("prettier").Config} */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],

  // Prettier
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",

  // Tailwind CSS v4
  tailwindStylesheet: "./app/globals.css",

  // Import sorting
  importOrder: [
    "^react$",
    "<THIRD_PARTY_MODULES>",

    "^\\./(.*)$",
    "^\\.\\./(.*)$",

    "^@public/(.*)$",
    "^@components/(.*)$",
    "^@hooks/(.*)$",
    "^@utils/(.*)$",
    "^@enums/(.*)$",
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^@/(.*)$",
  ],

  // Пустая строка между группами импортов
  importOrderSeparation: true,

  // Сортировка именованных импортов
  importOrderSortSpecifiers: true,
};

export default config;
