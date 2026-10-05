import Link from "next/link";
import Image from "next/image";

export default function MobileTopBar() {
  return (
    <div className="relative z-20 w-full px-5 md:hidden">
      <header className="mx-auto flex h-14 max-w-[520px] items-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg focus-visible:outline-offset-4"
          aria-label="Pawsons Home"
        >
          <Image
            src="/logos/Logo_main.svg"
            width={120}
            height={28}
            alt="pawsons"
            preload
            className="h-auto w-28 object-contain"
          />
        </Link>
      </header>
    </div>
  );
}
