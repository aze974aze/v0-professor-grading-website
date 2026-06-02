"use server"

import { db } from "@/lib/db"
import { professors, ratings, comments, user } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq, desc, ilike, or, and, sql, avg } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Helper to get current session
async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

// Helper to check if user is admin
async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  if (session.user.role !== "admin") throw new Error("Admin access required")
  return session.user
}

// Helper to check if user is authenticated
async function requireAuth() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  if (session.user.banned) throw new Error("Your account has been banned")
  return session.user
}

// ============ Professor Actions ============

export async function getProfessors(search?: string) {
  const baseQuery = db.select().from(professors)
  
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    return baseQuery.where(
      or(
        ilike(professors.name, searchTerm),
        ilike(professors.department, searchTerm),
        ilike(professors.university, searchTerm)
      )
    ).orderBy(desc(professors.createdAt))
  }
  
  return baseQuery.orderBy(desc(professors.createdAt))
}

export async function getProfessor(id: number) {
  const result = await db
    .select()
    .from(professors)
    .where(eq(professors.id, id))
    .limit(1)
  return result[0] || null
}

export async function addProfessor(data: {
  name: string
  department: string
  university: string
  imageUrl?: string
}) {
  await requireAdmin()
  
  const result = await db
    .insert(professors)
    .values({
      name: data.name,
      department: data.department,
      university: data.university,
      imageUrl: data.imageUrl || null,
    })
    .returning()
  
  revalidatePath("/")
  revalidatePath("/admin")
  return result[0]
}

export async function deleteProfessor(id: number) {
  await requireAdmin()
  
  // Delete associated ratings and comments first
  await db.delete(ratings).where(eq(ratings.professorId, id))
  await db.delete(comments).where(eq(comments.professorId, id))
  await db.delete(professors).where(eq(professors.id, id))
  
  revalidatePath("/")
  revalidatePath("/admin")
}

// ============ Rating Actions ============

export async function getRatings(professorId: number) {
  return db
    .select()
    .from(ratings)
    .where(eq(ratings.professorId, professorId))
    .orderBy(desc(ratings.createdAt))
}

export async function getAverageRatings(professorId: number) {
  const result = await db
    .select({
      teachingQuality: avg(ratings.teachingQuality),
      communication: avg(ratings.communication),
      availability: avg(ratings.availability),
      helpfulness: avg(ratings.helpfulness),
      difficulty: avg(ratings.difficulty),
      count: sql<number>`count(*)::int`,
    })
    .from(ratings)
    .where(eq(ratings.professorId, professorId))
  
  const data = result[0]
  if (!data || data.count === 0) {
    return {
      teachingQuality: 0,
      communication: 0,
      availability: 0,
      helpfulness: 0,
      difficulty: 0,
      overall: 0,
      count: 0,
    }
  }
  
  const tq = Number(data.teachingQuality) || 0
  const comm = Number(data.communication) || 0
  const avail = Number(data.availability) || 0
  const help = Number(data.helpfulness) || 0
  const diff = Number(data.difficulty) || 0
  
  return {
    teachingQuality: tq,
    communication: comm,
    availability: avail,
    helpfulness: help,
    difficulty: diff,
    overall: (tq + comm + avail + help + (6 - diff)) / 5,
    count: data.count,
  }
}

export async function submitRating(data: {
  professorId: number
  teachingQuality: number
  communication: number
  availability: number
  helpfulness: number
  difficulty: number
}) {
  // Ratings are anonymous, no auth required
  const result = await db
    .insert(ratings)
    .values({
      professorId: data.professorId,
      teachingQuality: data.teachingQuality,
      communication: data.communication,
      availability: data.availability,
      helpfulness: data.helpfulness,
      difficulty: data.difficulty,
    })
    .returning()
  
  revalidatePath(`/professor/${data.professorId}`)
  revalidatePath("/")
  return result[0]
}

// ============ Comment Actions ============

export async function getComments(professorId: number) {
  return db
    .select()
    .from(comments)
    .where(eq(comments.professorId, professorId))
    .orderBy(desc(comments.createdAt))
}

export async function addComment(data: { professorId: number; content: string }) {
  const currentUser = await requireAuth()
  
  const result = await db
    .insert(comments)
    .values({
      professorId: data.professorId,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.image || null,
      content: data.content,
    })
    .returning()
  
  revalidatePath(`/professor/${data.professorId}`)
  return result[0]
}

export async function deleteComment(commentId: number) {
  await requireAdmin()
  
  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1)
  
  if (comment[0]) {
    await db.delete(comments).where(eq(comments.id, commentId))
    revalidatePath(`/professor/${comment[0].professorId}`)
    revalidatePath("/admin")
  }
}

// ============ User/Admin Actions ============

export async function getUsers() {
  await requireAdmin()
  return db.select().from(user).orderBy(desc(user.createdAt))
}

export async function banUser(userId: string, reason: string) {
  await requireAdmin()
  
  await db
    .update(user)
    .set({ banned: true, banReason: reason })
    .where(eq(user.id, userId))
  
  revalidatePath("/admin")
}

export async function unbanUser(userId: string) {
  await requireAdmin()
  
  await db
    .update(user)
    .set({ banned: false, banReason: null, banExpires: null })
    .where(eq(user.id, userId))
  
  revalidatePath("/admin")
}

export async function getAllComments() {
  await requireAdmin()
  
  return db
    .select({
      id: comments.id,
      professorId: comments.professorId,
      userId: comments.userId,
      userName: comments.userName,
      userImage: comments.userImage,
      content: comments.content,
      createdAt: comments.createdAt,
      professorName: professors.name,
    })
    .from(comments)
    .leftJoin(professors, eq(comments.professorId, professors.id))
    .orderBy(desc(comments.createdAt))
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function isAdmin() {
  const session = await getSession()
  return session?.user?.role === "admin"
}
