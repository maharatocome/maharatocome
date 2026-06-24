import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const skill = searchParams.get("skill");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (type && type !== "ALL") where.type = type;
    if (skill) where.tags = { some: { skill: { name: { contains: skill } } } };
    if (search) where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, title: true, city: true, type: true, avatar: true } },
        tags: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, content, budget, duration, location, skillIds } = await req.json();
    if (!userId || !type || !title || !content)
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        userId, type, title, content, budget, duration, location,
        tags: {
          create: skillIds?.map((sid: string) => ({ skillId: sid })) || [],
        },
      },
      include: {
        user: { select: { id: true, name: true, title: true, city: true, type: true } },
        tags: { include: { skill: true } },
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
