import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true, title: true, type: true } } },
        },
        messages: {
          include: { sender: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
