import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import Navigation from "@/components/navigation";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html lang="th" className={fredoka.variable}>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Itim&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          className="fixed top-3 left-3 z-100 -translate-y-[160%] rounded-full bg-ink px-[18px] py-2.5 text-small text-white focus:translate-y-0"
          href="#main"
        >
          ข้ามไปเนื้อหา
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
