"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AppCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export default function AppCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  category,
  isNew,
  isFeatured,
}: AppCardProps) {
  const slug = href.split("/").pop() ?? "";

  const track = () => {
    fetch(`/api/track?app=${slug}`, { method: "POST" }).catch(() => {});
  };

  return (
    <Link href={href} onClick={track} className="group block">
      <div className="app-card relative rounded-2xl border border-border/60 bg-card/50 p-6 h-full overflow-hidden">
        {/* Gradient accent top border */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
        />

        {/* Glow on hover */}
        <div
          className={`absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-3xl group-hover:opacity-10 transition-opacity duration-500`}
        />

        <div className="relative">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              {isNew && (
                <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  New
                </span>
              )}
              {isFeatured && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
          </div>

          {/* Category */}
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted mb-1.5 block">
            {category}
          </span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted leading-relaxed mb-4">
            {description}
          </p>

          {/* CTA */}
          <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
            Open App
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
