import { redirect } from "next/navigation";

import { IntroGameEditor } from "@/components/admin/IntroGameEditor";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { getIntroConfig } from "@/lib/intro/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminIntroPage() {
  if (!(await getMediaAdmin())) redirect("/login");

  const [config, images] = await Promise.all([
    getIntroConfig(),
    prisma.mediaAsset.findMany({
      where: { resourceType: "image" },
      orderBy: { createdAt: "desc" },
      take: 400,
      select: { id: true, title: true, url: true, category: true },
    }),
  ]);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#2ca48a] uppercase">
          Головна сторінка / Вступна гра
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#f0dfcf] sm:text-5xl">
          Гра в <span className="text-[#2ca48a] italic">голови</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b19b8e]">
          Обери одинадцять образів Слави, налаштуй написи й темп гри. Фото зберігаються в
          Cloudinary, а рівні — у PostgreSQL.
        </p>
      </div>
      <IntroGameEditor initial={config} images={images} />
    </section>
  );
}
