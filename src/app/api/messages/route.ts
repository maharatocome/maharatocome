import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const sender = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!sender) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const { conversationId, content } = await req.json();
    if (!conversationId || !content?.trim()) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

    const message = await prisma.message.create({
      data: { conversationId, senderId: sender.id, content: content.trim() },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Mettre à jour la date de la conversation pour le tri
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
