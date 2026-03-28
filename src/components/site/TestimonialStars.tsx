import { Star } from "lucide-react";

export function TestimonialStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const iconSizeClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          className={`${iconSizeClass} ${index < rating ? "fill-current" : "opacity-25"}`}
          key={index}
        />
      ))}
    </div>
  );
}
