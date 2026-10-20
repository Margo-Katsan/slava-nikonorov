import { redirect } from "next/navigation";

import { BioEditor } from "@/components/admin/BioEditor";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { getBioProfile } from "@/lib/bio/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBioPage() {
  if (!(await getMediaAdmin())) redirect("/login");

  const [profile, images] = await Promise.all([
    getBioProfile(),
    prisma.mediaAsset.findMany({
      where: { resourceType: "image" },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: { id: true, title: true, url: true, category: true },
    }),
  ]);

  return (
    <section className="space-y-7">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#31a88f] uppercase">
          Головна сторінка / Біографія
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#efdfcd] sm:text-5xl">
          Трохи про <span className="text-[#31a88f] italic">мене</span>
        </h1>
        <p className="mt-3 max-w-[750px] text-sm leading-7 text-[#b8a194]">
          Змінюй текст короткої й розширеної біографії, а також три кадри кіноплівки. Зображення
          обираються з медіатеки Cloudinary.
        </p>
      </header>

      <BioEditor profile={profile} images={images} />
    </section>
  );
}
