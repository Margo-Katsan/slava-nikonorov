import Image from "next/image";

/**
 * One compositional stage for all heads: their X/Y coordinates are measured
 * against the SAME stage, never against the full Hero height separately.
 *
 * The main portrait occupies the foreground; the five supporting expressions
 * touch it visually along their edges. Desktop and mobile are tuned separately.
 * No parallax: the collage keeps its deliberate silhouette while scrolling.
 */
type FacePosition = {
  src: string;
  x: string;
  y: string;
  width: string;
  angle: number;
  layer: number;
  tone: string;
};

const DESKTOP_FACES: readonly FacePosition[] = [
  // Quiet, distant expression connects the two upper portraits.
  {
    src: "/images/hero-faces/face-05.png",
    x: "50%",
    y: "19%",
    width: "25%",
    angle: -2,
    layer: 1,
    tone: "opacity-55 brightness-[0.66] saturate-[0.75]",
  },
  // Broad expressions flank the central portrait and slightly tuck behind it.
  {
    src: "/images/hero-faces/face-02.png",
    x: "22%",
    y: "44%",
    width: "41%",
    angle: -2,
    layer: 5,
    tone: "opacity-95 brightness-[0.86] saturate-[0.88]",
  },
  {
    src: "/images/hero-faces/face-01.png",
    x: "79%",
    y: "43%",
    width: "40%",
    angle: 2,
    layer: 5,
    tone: "opacity-95 brightness-[0.87] saturate-[0.9]",
  },
  // The bottom expressions now TOUCH the group; no isolated heads at the foot.
  {
    src: "/images/hero-faces/face-04.png",
    x: "28%",
    y: "73%",
    width: "29%",
    angle: -2,
    layer: 8,
    tone: "opacity-90 brightness-[0.82] saturate-[0.86]",
  },
  {
    src: "/images/hero-faces/face-06.png",
    x: "76%",
    y: "73%",
    width: "30%",
    angle: 2,
    layer: 8,
    tone: "opacity-93 brightness-[0.85] saturate-[0.9]",
  },
];

const MOBILE_FACES: readonly FacePosition[] = [
  {
    src: "/images/hero-faces/face-05.png",
    x: "50%",
    y: "19%",
    width: "26%",
    angle: -2,
    layer: 1,
    tone: "opacity-60 brightness-[0.7] saturate-[0.8]",
  },
  {
    src: "/images/hero-faces/face-02.png",
    x: "23%",
    y: "40%",
    width: "43%",
    angle: -2,
    layer: 5,
    tone: "opacity-95 brightness-[0.86] saturate-[0.88]",
  },
  {
    src: "/images/hero-faces/face-01.png",
    x: "77%",
    y: "40%",
    width: "43%",
    angle: 2,
    layer: 5,
    tone: "opacity-95 brightness-[0.87] saturate-[0.9]",
  },
  {
    src: "/images/hero-faces/face-04.png",
    x: "25%",
    y: "73%",
    width: "34%",
    angle: -2,
    layer: 8,
    tone: "opacity-88 brightness-[0.81] saturate-[0.85]",
  },
  {
    src: "/images/hero-faces/face-06.png",
    x: "75%",
    y: "73%",
    width: "34%",
    angle: 2,
    layer: 8,
    tone: "opacity-92 brightness-[0.85] saturate-[0.9]",
  },
];

function PortraitLayer({ face, sizes }: { face: FacePosition; sizes: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: face.x,
        top: face.y,
        width: face.width,
        zIndex: face.layer,
      }}
    >
      <Image
        src={face.src}
        alt=""
        width={420}
        height={500}
        sizes={sizes}
        draggable={false}
        style={{ transform: `rotate(${face.angle}deg)` }}
        className={`block h-auto w-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.47)] select-none ${face.tone}`}
      />
    </div>
  );
}

function PortraitGroup({
  faces,
  sizes,
  mainWidth,
}: {
  faces: readonly FacePosition[];
  sizes: string;
  mainWidth: string;
}) {
  return (
    <>
      {/* Common light/shadow source merges six separate cutouts into one mass. */}
      <div
        aria-hidden="true"
        className="absolute top-[54%] left-1/2 h-[76%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(151,83,49,0.22)_0%,rgba(69,35,24,0.15)_37%,transparent_72%)] blur-[34px]"
      />
      {faces.map((face) => (
        <PortraitLayer key={face.src} face={face} sizes={sizes} />
      ))}
      <div
        aria-hidden="true"
        className="absolute top-[53%] left-[51%] z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ width: mainWidth }}
      >
        <Image
          src="/images/portrait.png"
          alt=""
          width={700}
          height={760}
          priority
          sizes={sizes}
          draggable={false}
          className="block h-auto w-full object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,0.55)] select-none"
        />
      </div>
    </>
  );
}

export function HeroFaces() {
  return (
    <div
      role="img"
      aria-label="Шість образів Слави Ніконорова в кінематографічному колажі"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {/* Mobile & tablet: same tight portrait group, scaled down together. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-full w-full max-w-[540px] -translate-x-1/2 -translate-y-1/2 lg:hidden"
      >
        <PortraitGroup
          faces={MOBILE_FACES}
          sizes="(max-width: 639px) 48vw, (max-width: 1023px) 250px, 0px"
          mainWidth="73%"
        />
      </div>

      {/* Desktop: the whole collage has one consistent aspect ratio. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-[1%] hidden aspect-[1.11] w-[54%] max-w-[760px] -translate-y-1/2 lg:block xl:w-[57%]"
      >
        <PortraitGroup
          faces={DESKTOP_FACES}
          sizes="(min-width: 1440px) 350px, (min-width: 1024px) 28vw, 0px"
          mainWidth="63%"
        />
      </div>

      {/* The collage fades into the page without cutting heads at the bottom. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-30 h-[5%] bg-gradient-to-t from-site-bg/25 to-transparent"
      />
    </div>
  );
}
