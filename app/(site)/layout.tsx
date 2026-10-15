import { Header } from "@/components/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <Header />
      {children}
      <footer className="footer wrap">
        <span>© {new Date().getFullYear()} Слава Ніконоров</span>
        <a href="mailto:hello@example.com">КОНТАКТИ ↗</a>
      </footer>
    </div>
  );
}
