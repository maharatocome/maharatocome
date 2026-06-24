import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAHARAtoCOME — Plateforme Professionnelle Algérienne",
  description: "Connectez experts, PME et talents algériens. Publiez vos offres, trouvez des compétences, boostez votre carrière.",
  keywords: "expert algérie, talents algériens, PME algérie, offres emploi algérie, compétences digitales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
