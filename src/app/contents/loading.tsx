import { postGrid } from "@/components/post-card";
import {
  CardSkeleton,
  HeroSkeleton,
  LoadingStatus,
  ToolbarSkeleton,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingStatus className="min-h-dvh overflow-x-clip pt-10 max-md:pt-14">
      <HeroSkeleton />
      <div className="wrap mt-6 pt-6">
        <ToolbarSkeleton />
        <div className={postGrid}>
          {Array.from({ length: 8 }, (_, i) => (
            <CardSkeleton key={i} shape="post" />
          ))}
        </div>
      </div>
    </LoadingStatus>
  );
}
