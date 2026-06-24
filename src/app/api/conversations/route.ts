import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true, title: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const { participantId, postRef, postTitle } = await req.json();
    if (!participantId) return NextResponse.json({ error: "Participant requis" }, { status: 400 });
    if (participantId === currentUser.id) return NextResponse.json({ error: "Vous ne pouvez pas vous contacter vous-même" }, { status: 400 });

    // Chercher si une conversation existe déjà pour ce post entre ces deux utilisateurs
    const existing = await prisma.conversation.findFirst({
      where: {
        postRef: postRef || null,
        participants: { every: { userId: { in: [currentUser.id, participantId] } } },
      },
      include: { participants: true },
    });

    if (existing && existing.participants.length === 2) {
      return NextResponse.json({ id: existing.id });
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        postRef: postRef || null,
        postTitle: postTitle || null,
        participants: {
          create: [{ userId: currentUser.id }, { userId: participantId }],
        },
      },
    });

    return NextResponse.json({ id: conversation.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
