import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

interface TrustBadgeProps {
  score: number;
  band?: "verified" | "review" | "flagged";
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  band = score >= 75 ? "verified" : score >= 50 ? "review" : "flagged",
  size = "md",
  showScore = true
}) => {
  const isVerified = band === "verified";
  const isReview = band === "review";
  const isFlagged = band === "flagged";

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2"
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div
      className={`inline-flex items-center font-medium rounded-full border transition-all ${
        sizeClasses[size]
      } ${
        isVerified
          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30"
          : isReview
          ? "bg-amber-950/60 text-amber-400 border-amber-500/30"
          : "bg-rose-950/60 text-rose-400 border-rose-500/30 glow-flagged animate-pulse"
      }`}
    >
      {isVerified && <ShieldCheck size={iconSizes[size]} className="text-emerald-400 shrink-0" />}
      {isReview && <AlertTriangle size={iconSizes[size]} className="text-amber-400 shrink-0" />}
      {isFlagged && <ShieldAlert size={iconSizes[size]} className="text-rose-400 shrink-0" />}

      <span>
        {isVerified ? "Verified" : isReview ? "Needs Review" : "Flagged"}
      </span>

      {showScore && (
        <span
          className={`ml-0.5 font-bold ${
            isVerified ? "text-emerald-300" : isReview ? "text-amber-300" : "text-rose-300"
          }`}
        >
          {score}/100
        </span>
      )}
    </div>
  );
};
