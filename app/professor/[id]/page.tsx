"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { StarRating } from "@/components/star-rating";
import { RatingForm } from "@/components/rating-form";
import { CommentSection } from "@/components/comment-section";
import { useData } from "@/lib/data-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

function RatingBar({ label, value, maxValue = 5 }: { label: string; value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

export default function ProfessorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { professors, getAverageRatings } = useData();
  
  const professor = professors.find((p) => p.id === resolvedParams.id);

  if (!professor) {
    notFound();
  }

  const ratings = getAverageRatings(professor.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to all professors
          </Button>
        </Link>

        {/* Professor Header */}
        <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-border">
            <Image
              src={professor.imageUrl}
              alt={professor.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{professor.name}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{professor.department}</p>
            <p className="text-muted-foreground">{professor.university}</p>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={Math.round(ratings.overall)} size="lg" />
              <span className="text-2xl font-bold text-foreground">
                {ratings.overall > 0 ? ratings.overall.toFixed(1) : "N/A"}
              </span>
              {ratings.totalRatings > 0 && (
                <Badge variant="secondary">
                  {ratings.totalRatings} {ratings.totalRatings === 1 ? "rating" : "ratings"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Ratings Summary & Form */}
          <div className="space-y-6 lg:col-span-1">
            {/* Rating Summary */}
            {ratings.totalRatings > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RatingBar label="Teaching Quality" value={ratings.teachingQuality} />
                  <RatingBar label="Communication" value={ratings.communication} />
                  <RatingBar label="Availability" value={ratings.availability} />
                  <RatingBar label="Helpfulness" value={ratings.helpfulness} />
                  <div className="border-t border-border pt-4">
                    <RatingBar label="Difficulty" value={ratings.difficulty} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      1 = Easy, 5 = Challenging
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rating Form */}
            <RatingForm professorId={professor.id} />
          </div>

          {/* Right Column - Comments */}
          <div className="lg:col-span-2">
            <CommentSection professorId={professor.id} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RateMyProf - Help students make informed decisions</p>
        </div>
      </footer>
    </div>
  );
}
