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
      <section className="mt-24 pt-6 pb-[120px] max-md:mt-[72px]">
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
