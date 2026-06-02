"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { useData, Professor } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";

interface ProfessorCardProps {
  professor: Professor;
}

export function ProfessorCard({ professor }: ProfessorCardProps) {
  const { getAverageRatings } = useData();
  const ratings = getAverageRatings(professor.id);

  return (
    <Link href={`/professor/${professor.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-border">
              <Image
                src={professor.imageUrl}
                alt={professor.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {professor.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {professor.department}
              </p>
              <p className="truncate text-xs text-muted-foreground/70">
                {professor.university}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(ratings.overall)} size="sm" />
              <span className="text-sm font-medium text-foreground">
                {ratings.overall > 0 ? ratings.overall.toFixed(1) : "N/A"}
              </span>
            </div>
            {ratings.totalRatings > 0 && (
              <Badge variant="secondary" className="text-xs">
                {ratings.totalRatings} {ratings.totalRatings === 1 ? "rating" : "ratings"}
              </Badge>
            )}
          </div>

          {ratings.totalRatings > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teaching</span>
                <span className="font-medium text-foreground">{ratings.teachingQuality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Communication</span>
                <span className="font-medium text-foreground">{ratings.communication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium text-foreground">{ratings.availability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Helpfulness</span>
                <span className="font-medium text-foreground">{ratings.helpfulness}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
