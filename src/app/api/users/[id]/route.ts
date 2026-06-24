import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, title: true, bio: true, city: true,
        phone: true, website: true, avatar: true, type: true, createdAt: true,
        skills: { include: { skill: true } },
        experiences: { orderBy: { startDate: "desc" } },
        posts: {
          include: { tags: { include: { skill: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { skillIds, ...userData } = data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: userData.name,
        title: userData.title,
        bio: userData.bio,
        city: userData.city,
        phone: userData.phone,
        website: userData.website,
        type: userData.type,
        ...(userData.avatar !== undefined && { avatar: userData.avatar }),
      },
    });

    if (skillIds !== undefined) {
      await prisma.userSkill.deleteMany({ where: { userId: id } });
      for (const item of skillIds) {
        await prisma.userSkill.create({
          data: { userId: id, skillId: item.skillId, level: item.level || "INTERMEDIAIRE" },
        });
      }
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
