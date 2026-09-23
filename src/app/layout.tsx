import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
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
          <Link href="/" className="footer-brand" aria-label="Pawsons หน้าแรก">
            <Image
              src="/logos/Logo_main.svg"
              alt="pawsons"
              width={125}
              height={28}
            />
          </Link>
          <div className="footer-info">
            <p>A little place to be you.</p>
            <span>ค่อย ๆ รู้จักกัน ในจังหวะของคุณ</span>
          </div>
          <div className="footer-actions">
            <Link href="/letters" className="button secondary footer-pill">
              <span>Personal letters</span>
              <span className="icon-disc" aria-hidden="true">↗</span>
            </Link>
            <small>© {new Date().getFullYear()} Pawsons · Made with a little warmth</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
