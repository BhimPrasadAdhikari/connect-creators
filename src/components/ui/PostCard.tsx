import { cn } from "@/lib/utils";
import { Lock, MessageSquare, Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

export interface PostCardProps {
  id?: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  tierName?: string;
  isPaid?: boolean;
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
  // Default isPaid to isLocked if not provided
  const isPaidContent = isPaid ?? isLocked;
  const postId = id || "post";
  
  const truncatedContent = content.length > 200 
    ? content.slice(0, 200) + "..." 
    : content;

  return (
    <Card 
      variant="brutal" 
      className={cn(
        "group overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal",
        className
      )}
    >
      {/* Media */}
      {mediaUrl && (
        <div className="relative aspect-video bg-muted border-b-3 border-brutal-black">
          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-brutal-black/80 backdrop-blur-sm p-6 text-center">
              <div className="bg-card border-3 border-brutal-black p-6 shadow-brutal-sm transform rotate-[-2deg]">
                <Lock className="w-8 h-8 mx-auto mb-3 text-foreground" />
                <p className="font-display font-bold text-lg uppercase">Subscribe to unlock</p>
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

      <CardContent className="p-6">
        {/* Creator Info */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b-2 border-dashed border-brutal-black/20">
          <Link href={`/creator/${creator.username}`} className="shrink-0 relative group/avatar">
            <div className="absolute inset-0 bg-brutal-black translate-x-1 translate-y-1 rounded-full group-hover/avatar:translate-x-1.5 group-hover/avatar:translate-y-1.5 transition-transform" />
            <div className="relative border-2 border-brutal-black rounded-full overflow-hidden bg-background">
              <Avatar src={creator.avatar} name={creator.name} size="md" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link 
              href={`/creator/${creator.username}`}
              className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors block truncate leading-tight"
            >
              {creator.name}
            </Link>
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {formatDate(createdAt)}
            </span>
          </div>
          {isPaidContent && (
            <Badge className={cn(
              "border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none px-3 font-bold uppercase",
              isLocked ? "bg-accent-yellow text-foreground" : "bg-accent-pink text-white"
            )}>
              {isLocked ? "Premium" : "Exclusive"}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
          <Link href={`/post/${postId}`}>
            {title}
          </Link>
        </h3>

        {/* Content */}
        {isLocked ? (
          <div className="relative my-4 p-6 bg-muted/30 border-2 border-brutal-black border-dashed">
            <p className="font-mono text-muted-foreground blur-sm select-none">
              {truncatedContent || "This content is locked. Subscribe to view the full post and interact with usages."}
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="brutal" size="sm" className="bg-background">
                <Lock className="w-4 h-4 mr-2" />
                Subscribe to read
              </Button>
            </div>
          </div>
        ) : (
          <div className="font-mono text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
            {truncatedContent}
          </div>
        )}

        {/* Footer */}
        {!isLocked && (
          <div className="flex items-center justify-between pt-2">
            <Link href={`/post/${postId}`}>
              <Button variant="ghost" className="font-bold font-mono text-sm hover:bg-primary/10 hover:text-primary -ml-2">
                Read more →
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm font-mono font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{commentsCount}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-accent-red cursor-pointer transition-colors">
                <Heart className="w-4 h-4" />
                <span>Like</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
