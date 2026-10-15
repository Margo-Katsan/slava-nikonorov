import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fake404">
      <div className="error-code">404</div>
      <h1>ЦЮ СТОРІНКУ ПОКИ НЕ ЗНАЙШЛИ.</h1>
      <Link href="/home">НА ГОЛОВНУ ↶</Link>
    </main>
  );
}
