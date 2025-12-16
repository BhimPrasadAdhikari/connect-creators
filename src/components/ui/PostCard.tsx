import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export interface PostCardProps {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  tierName?: string;
  isPaid: boolean;
  isLocked: boolean;
  createdAt: Date | string;
  creator: {
    username: string;
    name: string;
    avatar?: string | null;
  };
  commentsCount?: number;
  className?: string;
}

export function PostCard({
  id,
  title,
  content,
  mediaUrl,
  mediaType,
  isPaid,
  isLocked,
  createdAt,
  creator,
  commentsCount = 0,
  className,
}: PostCardProps) {
  const truncatedContent = content.length > 200 
    ? content.slice(0, 200) + "..." 
    : content;

  return (
    <article
      className={cn(
        "bg-card rounded-xl border border-border shadow-card overflow-hidden",
        "transition-shadow hover:shadow-card-hover",
        className
      )}
    >
      {/* Media */}
      {mediaUrl && (
        <div className="relative aspect-video bg-background">
          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-text-primary/80 backdrop-blur-sm">
              <div className="text-center text-white">
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Subscribe to unlock</p>
              </div>
            </div>
          ) : (
            <Image
              src={mediaUrl}
              alt={title}
              fill
              className="object-cover"
            />
          )}
        </div>
      )}

      <div className="p-5">
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/creator/${creator.username}`}>
            <Avatar src={creator.avatar} name={creator.name} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link 
              href={`/creator/${creator.username}`}
              className="font-medium text-text-primary hover:text-primary transition-colors block truncate"
            >
              {creator.name}
            </Link>
            <span className="text-sm text-text-secondary">
              {formatDate(createdAt)}
            </span>
          </div>
          {isPaid && (
            <Badge variant="accent">
              {isLocked ? "Premium" : "Exclusive"}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          <Link href={`/post/${id}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </h3>

        {/* Content */}
        {isLocked ? (
          <div className="relative">
            <p className="text-text-secondary line-clamp-3 blur-sm select-none">
              {truncatedContent}
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card px-4 py-2 rounded-lg shadow-card border border-border">
                <Lock className="w-4 h-4 inline-block mr-2 text-accent" />
                <span className="text-sm font-medium text-text-primary">
                  Subscribe to read
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-text-secondary line-clamp-3">{truncatedContent}</p>
        )}

        {/* Footer */}
        {!isLocked && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <Link
              href={`/post/${id}`}
              className="text-sm text-primary font-medium hover:underline"
            >
              Read more →
            </Link>
            <span className="text-sm text-text-secondary">
              {commentsCount} comments
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
