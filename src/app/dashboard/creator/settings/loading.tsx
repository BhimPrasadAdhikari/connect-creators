import { SettingsPageSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      <SettingsPageSkeleton />
    </div>
  );
}
