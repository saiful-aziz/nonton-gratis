import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookmarks — get all bookmarks for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

// POST /api/bookmarks — add a bookmark
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tmdbId, title, posterPath, releaseDate, voteAverage } = await request.json();

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_tmdbId: { userId: session.user.id, tmdbId } },
    create: { userId: session.user.id, tmdbId, title, posterPath, releaseDate, voteAverage },
    update: {},
  });

  return NextResponse.json(bookmark, { status: 201 });
}

// DELETE /api/bookmarks?tmdbId=123 — remove a bookmark
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tmdbId = parseInt(request.nextUrl.searchParams.get("tmdbId") || "");
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid tmdbId" }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({
    where: { userId: session.user.id, tmdbId },
  });

  return NextResponse.json({ success: true });
}
