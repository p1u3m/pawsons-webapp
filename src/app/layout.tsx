import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/navigation";
import Reveal from "@/components/reveal";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Pawsons | A little place to be you",
    template: "%s | Pawsons",
  },
  description:
    "พักสักนิด ทำความรู้จักตัวเอง และพบเพื่อนตัวน้อยในโลกของ Pawsons",
  icons: { icon: "/logos/Logo_main.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        {["en-regular", "en-bold", "th-regular", "th-bold"].map((font) => (
          <link
            key={font}
            rel="preload"
            href={`/fonts/${font}.woff2`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <a className="skip-link" href="#main">
          ข้ามไปเนื้อหา
        </a>
        <Navigation />
        <Reveal>
          <main id="main">{children}</main>
        </Reveal>
        <footer className="site-footer">
          <Link href="/" className="footer-wordmark">
            pawsons
          </Link>
          <p>A little place to be you.</p>
          <span>ค่อย ๆ รู้จักกัน ในจังหวะของคุณ</span>
          <Link href="/letters">Personal letters ↗</Link>
          <small>© {new Date().getFullYear()} Pawsons</small>
        </footer>
      </body>
    </html>
  );
}
