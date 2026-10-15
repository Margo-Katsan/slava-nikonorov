import {
  ArrowUpRight,
  Camera,
  Clapperboard,
  Drama,
  Film,
  NotebookPen,
  Palette,
} from "lucide-react";

export function SectionIcon({ name, size = 44 }: { name: string; size?: number }) {
  const shared = { size, strokeWidth: 1.6 };
  switch (name) {
    case "film":
      return <Film {...shared} />;
    case "masks":
      return <Drama {...shared} />;
    case "clapper":
      return <Clapperboard {...shared} />;
    case "palette":
      return <Palette {...shared} />;
    case "book":
      return <NotebookPen {...shared} />;
    default:
      return <Camera {...shared} />;
  }
}
export { ArrowUpRight };
