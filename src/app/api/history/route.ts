import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/history — get watch history for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: 100,
  });

  return NextResponse.json(history);
}

// POST /api/history — add or update a watch history entry
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tmdbId, title, posterPath, releaseDate, voteAverage } = await request.json();

  const entry = await prisma.watchHistory.upsert({
    where: { userId_tmdbId: { userId: session.user.id, tmdbId } },
    create: { userId: session.user.id, tmdbId, title, posterPath, releaseDate, voteAverage },
    update: { watchedAt: new Date() },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/history?tmdbId=123 — remove one entry, or all if no tmdbId
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tmdbIdParam = request.nextUrl.searchParams.get("tmdbId");

  if (tmdbIdParam) {
    const tmdbId = parseInt(tmdbIdParam);
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: "Invalid tmdbId" }, { status: 400 });
    }
    await prisma.watchHistory.deleteMany({
      where: { userId: session.user.id, tmdbId },
    });
  } else {
    // Clear all history
    await prisma.watchHistory.deleteMany({
      where: { userId: session.user.id },
    });
  }

  return NextResponse.json({ success: true });
}
