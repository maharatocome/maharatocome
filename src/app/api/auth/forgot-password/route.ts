import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "L'e-mail est requis" }, { status: 400 });

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({ where: { email: { equals: cleanEmail, mode: "insensitive" } } });
    if (!user) {
      // Pour des raisons de sécurité, on ne dit pas si l'utilisateur n'existe pas.
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: cleanEmail, token, expires },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    // Envoyer l'email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.hostinger.com",
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || "nonoreply@maharatocome.dz",
        pass: process.env.EMAIL_PASSWORD || "",
      },
    });

    await transporter.sendMail({
      from: '"MaharaToCome" <' + (process.env.EMAIL_USER || "nonoreply@maharatocome.dz") + '>',
      to: cleanEmail,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Bonjour ${user.name},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Réinitialiser mon mot de passe</a>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
          <p>Ce lien est valide pendant 1 heure.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur ou de configuration email" }, { status: 500 });
  }
}
