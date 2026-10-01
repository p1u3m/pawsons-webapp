import { productGrid } from "@/components/shop/shop-ui";
import {
  CardSkeleton,
  HeroSkeleton,
  LoadingStatus,
  ToolbarSkeleton,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingStatus className="min-h-dvh pt-10 max-md:pt-14">
      <HeroSkeleton />
      {/* The shop's blue band, as on the page. */}
      <section className="band band-wave-top band-pattern mt-24 pt-6 pb-[120px] [--band:#dcefff] [--pattern:url(/patterns/shop.svg)] [--wave:120px] max-md:mt-[72px] max-md:[--wave:64px]">
        <div className="wrap">
          <ToolbarSkeleton />
          <div className={productGrid}>
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} shape="product" />
            ))}
          </div>
        </div>
      </section>
    </LoadingStatus>
  );
}
