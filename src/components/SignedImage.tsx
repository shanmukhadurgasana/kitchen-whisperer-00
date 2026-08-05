import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/services/storage";

export function SignedImage({
  path,
  alt,
  className,
}: {
  path: string | null;
  alt: string;
  className?: string;
}) {
  const { data: url, isLoading } = useQuery({
    queryKey: ["signed-url", path],
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
    queryFn: () => resolveImageUrl(path),
  });

  if (path && (isLoading || url)) {
    return url ? (
      <img src={url} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />
    ) : (
      <div className={cn("h-full w-full animate-pulse bg-muted", className)} />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-secondary text-muted-foreground",
        className,
      )}
      aria-label={alt}
    >
      <ImageIcon className="h-8 w-8 opacity-50" />
    </div>
  );
}
