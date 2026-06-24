import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMatchingAlgorithm } from "@/lib/matching";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, name: true, title: true, city: true, type: true, avatar: true } },
        tags: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const results = runMatchingAlgorithm(posts);
    return NextResponse.json(results.slice(0, 20)); // Top 20 matches
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
