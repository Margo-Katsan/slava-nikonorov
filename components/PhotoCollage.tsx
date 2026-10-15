import Image from "next/image";

const photos = [
  {
    id: "portrait",
    src: "/images/portrait.jpg",
    alt: "Портрет Слави Ніконорова",
    position: "center 28%",
    className:
      "left-[3%] top-[12%] z-20 w-[65%] aspect-[4/5] -rotate-[4deg] sm:left-[5%] sm:top-[8%] sm:w-[62%]",
    sizes: "(max-width: 640px) 65vw, 380px",
  },
  {
    id: "stage",
    src: "/images/stage.jpg",
    alt: "Слава на сцені",
    position: "center",
    className:
      "right-[1%] top-[3%] z-30 w-[35%] aspect-[4/4.5] rotate-[6deg] sm:right-[1%] sm:w-[36%]",
    sizes: "(max-width: 640px) 36vw, 210px",
  },
  {
    id: "costume",
    src: "/images/costume.jpg",
    alt: "Слава в комедійному образі",
    position: "center 20%",
    className:
      "right-[0%] top-[51%] z-30 w-[38%] aspect-[4/4.3] rotate-[3deg] sm:right-[2%] sm:top-[49%]",
    sizes: "(max-width: 640px) 40vw, 230px",
  },
  {
    id: "comic",
    src: "/images/comic.jpg",
    alt: "Слава в кінообразі",
    position: "center 35%",
    className:
      "left-[26%] bottom-[3%] z-40 w-[37%] aspect-[4/3] rotate-[5deg] sm:left-[27%] sm:bottom-[1%]",
    sizes: "(max-width: 640px) 40vw, 220px",
  },
];

export function PhotoCollage() {
  return (
    <div
      className="relative isolate mx-auto aspect-[1/1.15] w-full max-w-[570px] min-w-0"
      aria-label="Слава Ніконоров у різних творчих образах"
    >
      {/* Мягкое фоновое освещение */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(ellipse,rgba(155,78,61,0.27)_0%,rgba(95,43,35,0.12)_45%,transparent_75%)] blur-3xl"
      />

      {photos.map((photo) => (
        <figure
          key={photo.id}
          className={`group absolute m-0 transition-transform duration-500 ease-out hover:z-50 hover:scale-[1.035] ${photo.className}`}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[5px] bg-[#19100e] shadow-[0_20px_40px_rgba(0,0,0,0.38)] ring-1 ring-white/10">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={photo.id === "portrait"}
              sizes={photo.sizes}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                objectPosition: photo.position,
              }}
            />

            {/* Очень лёгкое затемнение */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}
