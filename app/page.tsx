import Link from "next/link";

export default function Intro() {
  return (
    <main className="intro-page">
      <div className="intro-note top">ОБЕРЕЖНО! ДАЛІ — САЙТ НІКОНОРОВА</div>
      <div
        className="intro-art"
        aria-label="Пластилінова гора з голів — місце для майбутнього GIF або анімації"
      >
        <div className="intro-head head-a">◉ ◉</div>
        <div className="intro-head head-b">● ◉</div>
        <div className="intro-head head-c">◉ ●</div>
        <div className="intro-face">
          <div className="eyes">
            <span>●</span>
            <span>●</span>
          </div>
          <Link href="/home" className="intro-mouth" aria-label="Увійти на сайт">
            ВАМ СЮДИ →
          </Link>
        </div>
        <div className="intro-head head-d">◉ ◉</div>
      </div>
      <p className="intro-note bottom">Я ПОКАЖУ, НАСКІЛЬКИ ГЛИБОКА РОТОВА НОРА...</p>
      <Link href="/home" className="intro-skip">
        Пропустити вступ →
      </Link>
    </main>
  );
}
