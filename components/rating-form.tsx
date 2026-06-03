"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { submitRating } from "@/app/actions/professor";

interface RatingFormProps {
  professorId: number;
  onSuccess?: () => void;
}

const categories = [
  { key: "teachingQuality", label: "Teaching Quality", description: "Clarity and effectiveness of instruction" },
  { key: "communication", label: "Communication", description: "Responsiveness and clarity in communication" },
  { key: "availability", label: "Availability", description: "Office hours and accessibility" },
  { key: "helpfulness", label: "Helpfulness", description: "Willingness to help students succeed" },
  { key: "difficulty", label: "Difficulty", description: "Course difficulty level (1=Easy, 5=Hard)" },
] as const;

export function RatingForm({ professorId, onSuccess }: RatingFormProps) {
  const [ratings, setRatings] = useState({
    teachingQuality: 0,
    communication: 0,
    availability: 0,
    helpfulness: 0,
    difficulty: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const isComplete = Object.values(ratings).every((r) => r > 0);

  const handleSubmit = () => {
    if (!isComplete) return;

    startTransition(async () => {
      try {
        await submitRating({
          professorId,
          ...ratings,
        });

        setSubmitted(true);
        onSuccess?.();

        // Reset after showing success
        setTimeout(() => {
          setSubmitted(false);
          setRatings({
            teachingQuality: 0,
            communication: 0,
            availability: 0,
            helpfulness: 0,
            difficulty: 0,
          });
        }, 2000);
      } catch (error) {
        console.error("Failed to submit rating:", error);
      }
    });
  };

  if (submitted) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-2 text-2xl">Thank you!</div>
            <p className="text-muted-foreground">Your rating has been submitted anonymously.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Rate This Professor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your rating is completely anonymous. Click the stars to rate each category.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => (
          <div key={category.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{category.label}</h4>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
              <StarRating
                rating={ratings[category.key]}
                interactive
                size="md"
                onRatingChange={(value) => handleRatingChange(category.key, value)}
              />
            </div>
          </div>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? "Submitting..." : "Submit Rating"}
        </Button>
        
        {!isComplete && (
          <p className="text-center text-xs text-muted-foreground">
            Please rate all categories to submit
          </p>
        )}
      </CardContent>
    </Card>
  );
}
