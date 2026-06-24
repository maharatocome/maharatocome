import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SKILLS = [
  { name: "Développement Web", category: "Tech" },
  { name: "Développement Mobile", category: "Tech" },
  { name: "Design UI/UX", category: "Design" },
  { name: "Digital Marketing", category: "Marketing" },
  { name: "Community Management", category: "Marketing" },
  { name: "SEO / SEM", category: "Marketing" },
  { name: "Comptabilité", category: "Finance" },
  { name: "Gestion de projet", category: "Management" },
  { name: "Rédaction de contenu", category: "Communication" },
  { name: "Traduction FR/AR", category: "Communication" },
  { name: "Photographie", category: "Créatif" },
  { name: "Vidéo & Montage", category: "Créatif" },
  { name: "Architecture", category: "Ingénierie" },
  { name: "Data Science", category: "Tech" },
  { name: "Intelligence Artificielle", category: "Tech" },
  { name: "Cybersécurité", category: "Tech" },
  { name: "Expert", category: "Profil" },
  { name: "Formation", category: "Éducation" },
  { name: "E-commerce", category: "Business" },
  { name: "Graphisme", category: "Design" },
];

async function main() {
  console.log("🌱 Seeding Skills into TalentDZ database...");

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  
  console.log("✅ Skills created successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
