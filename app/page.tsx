"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { ProfessorCard } from "@/components/professor-card";
import { useData } from "@/lib/data-context";

export default function HomePage() {
  const { searchProfessors, professors } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfessors = searchQuery
    ? searchProfessors(searchQuery)
    : professors;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find and Rate Your
            <span className="text-primary"> Professors</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Search for professors, read reviews, and share your academic experience
            with the community.
          </p>

          {/* Search Bar */}
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by professor name, department, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 text-lg bg-card border-border"
            />
          </div>
        </section>

        {/* Professors Grid */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              {searchQuery ? "Search Results" : "Featured Professors"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredProfessors.length}{" "}
              {filteredProfessors.length === 1 ? "professor" : "professors"}
            </span>
          </div>

          {filteredProfessors.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProfessors.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No professors found matching &quot;{searchQuery}&quot;
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search term
              </p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold text-foreground">Search</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Find professors by name, department, or university
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold text-foreground">Rate</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit anonymous ratings across multiple criteria
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold text-foreground">Comment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to share detailed reviews and experiences
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RateMyProf - Help students make informed decisions</p>
          <p className="mt-2">Built with Next.js and shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
