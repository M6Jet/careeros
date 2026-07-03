import "./globals.css";
import Link from "next/link";

export const metadata = { title: "CareerOS", description: "AI Career Operating System" };

const NAV = [
  ["/", "🏠 Dashboard"], ["/resume", "📄 Resume"], ["/jobs", "💼 Jobs"],
  ["/network", "🤝 Network"], ["/interview", "🎤 Interview"], ["/certs", "🏅 Certs"],
  ["/learning", "📚 Learning"], ["/github", "🐙 GitHub"], ["/coach", "🤖 Coach"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="shell">
          <aside>
            <div className="logo">🚀 Career<span>OS</span></div>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="nav-item">{label}</Link>
            ))}
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
