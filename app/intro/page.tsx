import { redirect } from "next/navigation";

import SlavaHeadsIntro from "@/components/SlavaHeadsIntro";

import { getIntroConfig } from "@/lib/intro/settings";

export const dynamic = "force-dynamic";

export default async function IntroPage() {
  const intro = await getIntroConfig();
  if (!intro.enabled) redirect(intro.siteHref);
  return <SlavaHeadsIntro intro={intro} />;
}
