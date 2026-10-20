import { redirect } from "next/navigation";

import { MediaManager } from "@/components/admin/MediaManager";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  if (!(await getMediaAdmin())) redirect("/login");

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
          Керування контентом / Cloudinary
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#efdfcd] sm:text-5xl">
          Медіа<span className="text-[#31a88f] italic">тека</span>
        </h1>
        <p className="mt-3 max-w-[670px] text-sm leading-7 text-[#af998d]">
          Завантажуй фотографії, голови для гри, афіші та відео. Файли зберігаються в Cloudinary, а
          їхні назви та посилання — у базі сайту.
        </p>
      </header>
      <MediaManager
        initialItems={assets.map((asset) => ({
          ...asset,
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
        }))}
        totalShown={assets.length}
      />
    </section>
  );
}
