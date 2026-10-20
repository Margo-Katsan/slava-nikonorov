import { prisma } from "@/lib/prisma";

// Place in a Server Component (for example, app/page.tsx).
// If your hero is a Client Component, fetch status in a server parent and pass it as a prop.
export async function TodayThought() {
  const status = await prisma.siteStatus.findUnique({ where: { id: "home" } });
  const content = status?.content?.trim();
  if (!content) return null;

  return (
    <p className="font-serif text-base leading-relaxed break-words whitespace-pre-wrap text-site-cream">
      «{content}»
    </p>
  );
}
