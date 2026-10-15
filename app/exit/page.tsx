import Link from "next/link";

export default function Exit() {
  return (
    <main className="fake404">
      <div className="error-code">404</div>
      <h1>НЕ БУЛО ТУТ НІЯКОГО САЙТУ.</h1>
      <p>ВАМ ЗДАЛОСЯ.</p>
      <Link href="/home">А МОЖЕ, ВСЕ-ТАКИ БУВ? ↶</Link>
    </main>
  );
}
