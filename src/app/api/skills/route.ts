import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { category: "asc" } });
    return NextResponse.json(skills);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category } = await req.json();
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: category || "Autre" },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
