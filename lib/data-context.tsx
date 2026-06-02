"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Rating {
  id: string;
  professorId: string;
  teachingQuality: number;
  communication: number;
  availability: number;
  helpfulness: number;
  difficulty: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  professorId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Professor {
  id: string;
  name: string;
  department: string;
  university: string;
  imageUrl: string;
}

interface DataContextType {
  professors: Professor[];
  ratings: Rating[];
  comments: Comment[];
  addRating: (rating: Omit<Rating, "id" | "createdAt">) => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => void;
  getAverageRatings: (professorId: string) => {
    teachingQuality: number;
    communication: number;
    availability: number;
    helpfulness: number;
    difficulty: number;
    overall: number;
    totalRatings: number;
  };
  searchProfessors: (query: string) => Professor[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const mockProfessors: Professor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    department: "Computer Science",
    university: "Stanford University",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Prof. Michael Torres",
    department: "Mathematics",
    university: "MIT",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    department: "Physics",
    university: "Caltech",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Prof. James Miller",
    department: "Economics",
    university: "Harvard University",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Dr. Lisa Park",
    department: "Biology",
    university: "UC Berkeley",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "Prof. David Kim",
    department: "Chemistry",
    university: "Princeton University",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

const mockRatings: Rating[] = [
  { id: "r1", professorId: "1", teachingQuality: 5, communication: 4, availability: 5, helpfulness: 5, difficulty: 3, createdAt: new Date("2024-01-15") },
  { id: "r2", professorId: "1", teachingQuality: 4, communication: 5, availability: 4, helpfulness: 4, difficulty: 4, createdAt: new Date("2024-02-10") },
  { id: "r3", professorId: "1", teachingQuality: 5, communication: 5, availability: 3, helpfulness: 5, difficulty: 3, createdAt: new Date("2024-03-05") },
  { id: "r4", professorId: "2", teachingQuality: 3, communication: 4, availability: 3, helpfulness: 4, difficulty: 5, createdAt: new Date("2024-01-20") },
  { id: "r5", professorId: "2", teachingQuality: 4, communication: 3, availability: 4, helpfulness: 3, difficulty: 4, createdAt: new Date("2024-02-25") },
  { id: "r6", professorId: "3", teachingQuality: 5, communication: 5, availability: 5, helpfulness: 5, difficulty: 2, createdAt: new Date("2024-03-01") },
  { id: "r7", professorId: "3", teachingQuality: 4, communication: 4, availability: 4, helpfulness: 5, difficulty: 3, createdAt: new Date("2024-03-10") },
  { id: "r8", professorId: "4", teachingQuality: 3, communication: 3, availability: 2, helpfulness: 3, difficulty: 5, createdAt: new Date("2024-02-15") },
  { id: "r9", professorId: "5", teachingQuality: 5, communication: 4, availability: 4, helpfulness: 5, difficulty: 3, createdAt: new Date("2024-01-30") },
  { id: "r10", professorId: "6", teachingQuality: 4, communication: 5, availability: 3, helpfulness: 4, difficulty: 4, createdAt: new Date("2024-03-08") },
];

const mockComments: Comment[] = [
  { id: "c1", professorId: "1", userId: "u1", userName: "Alex Johnson", content: "Dr. Chen is an amazing professor! Her lectures are always engaging and she really cares about student success.", createdAt: new Date("2024-01-16") },
  { id: "c2", professorId: "1", userId: "u2", userName: "Maria Garcia", content: "One of the best CS professors I have ever had. Clear explanations and always available for office hours.", createdAt: new Date("2024-02-12") },
  { id: "c3", professorId: "2", userId: "u3", userName: "John Smith", content: "Prof. Torres makes complex math concepts understandable. The problem sets are challenging but fair.", createdAt: new Date("2024-01-22") },
  { id: "c4", professorId: "3", userId: "u4", userName: "Emma Wilson", content: "Dr. Watson is passionate about physics and it shows in every lecture. Highly recommend her courses!", createdAt: new Date("2024-03-02") },
  { id: "c5", professorId: "4", userId: "u5", userName: "Chris Lee", content: "The course material is interesting but office hours could be more accessible.", createdAt: new Date("2024-02-18") },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [professors] = useState<Professor[]>(mockProfessors);
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const addRating = (rating: Omit<Rating, "id" | "createdAt">) => {
    const newRating: Rating = {
      ...rating,
      id: `r${Date.now()}`,
      createdAt: new Date(),
    };
    setRatings((prev) => [...prev, newRating]);
  };

  const addComment = (comment: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...comment,
      id: `c${Date.now()}`,
      createdAt: new Date(),
    };
    setComments((prev) => [...prev, newComment]);
  };

  const getAverageRatings = (professorId: string) => {
    const professorRatings = ratings.filter((r) => r.professorId === professorId);
    if (professorRatings.length === 0) {
      return {
        teachingQuality: 0,
        communication: 0,
        availability: 0,
        helpfulness: 0,
        difficulty: 0,
        overall: 0,
        totalRatings: 0,
      };
    }

    const avg = (key: keyof Omit<Rating, "id" | "professorId" | "createdAt">) =>
      professorRatings.reduce((sum, r) => sum + r[key], 0) / professorRatings.length;

    const teachingQuality = avg("teachingQuality");
    const communication = avg("communication");
    const availability = avg("availability");
    const helpfulness = avg("helpfulness");
    const difficulty = avg("difficulty");
    const overall = (teachingQuality + communication + availability + helpfulness) / 4;

    return {
      teachingQuality: Math.round(teachingQuality * 10) / 10,
      communication: Math.round(communication * 10) / 10,
      availability: Math.round(availability * 10) / 10,
      helpfulness: Math.round(helpfulness * 10) / 10,
      difficulty: Math.round(difficulty * 10) / 10,
      overall: Math.round(overall * 10) / 10,
      totalRatings: professorRatings.length,
    };
  };

  const searchProfessors = (query: string) => {
    if (!query.trim()) return professors;
    const lowerQuery = query.toLowerCase();
    return professors.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.department.toLowerCase().includes(lowerQuery) ||
        p.university.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <DataContext.Provider
      value={{
        professors,
        ratings,
        comments,
        addRating,
        addComment,
        getAverageRatings,
        searchProfessors,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
