// Class strings shared by the character profile (/characters/[type]) and the
// house page (/houses/[house]): a house-coloured hero with a portrait on a
// cream arch, and the page-level focus ring and selection colour.

export const profilePage =
  "focus-ink overflow-x-clip pb-8 text-ink selection:bg-(--house-ink) selection:text-cream [--focus-offset:5px] [--focus-ring:var(--house-ink)]";
export const profileHero =
  "relative -mt-14 bg-(--band) pt-14 md:-mt-16 md:pt-16";
export const profileTopNav =
  "flex justify-between gap-5 pt-7 pb-9 max-md:gap-3 max-md:pt-8 max-md:pb-6 tiny:gap-2";
export const profileIntro =
  "grid grid-cols-[0.95fr_1fr] items-center gap-[clamp(32px,5vw,72px)] pb-12 max-md:flex max-md:flex-col max-md:gap-5 max-md:pb-7";
export const profilePortrait =
  "min-w-0 overflow-hidden rounded-[48%_48%_16px_16px] bg-cream px-6 py-5 max-md:w-[min(100%,264px)] max-md:px-5 max-md:py-4";
export const profilePortraitArt =
  "relative isolate grid aspect-square place-items-center before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-(image:--pattern) before:bg-size-[360px] before:bg-center before:opacity-65 before:mask-[radial-gradient(ellipse_closest-side,#000_55%,transparent_100%)] before:content-[''] max-md:aspect-[1.12] max-md:before:bg-size-[280px]";
export const profileIntroCopy = "min-w-0 max-md:w-full";
export const profileRole =
  "mt-3 text-[clamp(24px,2.4vw,32px)] leading-[1.3] tracking-[-0.015em] max-md:mt-2 max-md:text-[22px]";
export const profileKeywords =
  "mt-6 flex flex-wrap gap-2 text-(--house-ink) max-md:mt-[18px] max-md:gap-1.5";
export const profileKeyword =
  "rounded-full bg-cream px-3 py-1.5 text-[13px] max-md:px-2.5 max-md:py-[5px]";
export const profileTagline = "mt-7 mb-8 max-md:my-5";
export const profileTaglineLead =
  "text-[21px] leading-[1.55] font-semibold text-pretty text-(--house-ink) max-md:text-[20px]";
export const profileTaglineBody =
  "mt-2.5 text-[14px] leading-[1.8] text-(--house-ink)";
/** The house-coloured call-to-action chip. */
export const profilePrimary =
  "h-auto min-h-[52px] justify-center bg-(--house-ink) px-[22px] py-3 text-[16px] text-cream [--depth:3px] [--ledge-2:color-mix(in_srgb,var(--house-ink)_24%,var(--band))] [--ledge:color-mix(in_srgb,var(--house-ink)_75%,#000)] hover:bg-[color-mix(in_srgb,var(--house-ink)_90%,#000)] [&_svg]:text-inherit hover:[&_svg]:text-inherit";
