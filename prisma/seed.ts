import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  console.log("🌱 Seeding TalentDZ database...");

  // Create skills
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log("✅ Skills created");

  const hash = await bcrypt.hash("password123", 10);

  // User 1 - Expert Dev
  const user1 = await prisma.user.upsert({
    where: { email: "karim@talentdz.dz" },
    update: {},
    create: {
      email: "karim@talentdz.dz",
      password: hash,
      name: "Karim Benali",
      title: "Développeur Full Stack",
      bio: "Passionné de technologie avec 5 ans d'expérience en développement web et mobile. Je travaille avec les startups et PME algériennes pour digitaliser leurs activités.",
      city: "Alger",
      type: "EXPERT",
    },
  });

  // User 2 - PME
  const user2 = await prisma.user.upsert({
    where: { email: "sofia@startupdz.dz" },
    update: {},
    create: {
      email: "sofia@startupdz.dz",
      password: hash,
      name: "Sofia Amrani",
      title: "Directrice Marketing",
      bio: "Co-fondatrice d'une startup e-commerce à Oran. Je recherche des experts talentueux pour accompagner notre croissance.",
      city: "Oran",
      type: "PME",
    },
  });

  // User 3 - Designer
  const user3 = await prisma.user.upsert({
    where: { email: "yasmine@design.dz" },
    update: {},
    create: {
      email: "yasmine@design.dz",
      password: hash,
      name: "Yasmine Kaci",
      title: "Designer UI/UX Senior",
      bio: "Designer créative spécialisée dans les interfaces digitales. Je transforme les idées en expériences visuelles mémorables pour les entreprises algériennes.",
      city: "Constantine",
      type: "EXPERT",
    },
  });

  // User 4 - Chercheur d'emploi
  const user4 = await prisma.user.upsert({
    where: { email: "amine@talent.dz" },
    update: {},
    create: {
      email: "amine@talent.dz",
      password: hash,
      name: "Amine Meziane",
      title: "Data Scientist Junior",
      bio: "Diplômé en informatique de l'USTHB, je cherche des missions en data science et IA pour mettre mes compétences au service de projets innovants.",
      city: "Alger",
      type: "CHERCHEUR",
    },
  });

  console.log("✅ Users created");

  // Get skills
  const devWeb = await prisma.skill.findUnique({ where: { name: "Développement Web" } });
  const devMobile = await prisma.skill.findUnique({ where: { name: "Développement Mobile" } });
  const design = await prisma.skill.findUnique({ where: { name: "Design UI/UX" } });
  const marketing = await prisma.skill.findUnique({ where: { name: "Digital Marketing" } });
  const cm = await prisma.skill.findUnique({ where: { name: "Community Management" } });
  const data = await prisma.skill.findUnique({ where: { name: "Data Science" } });
  const ia = await prisma.skill.findUnique({ where: { name: "Intelligence Artificielle" } });
  const ecom = await prisma.skill.findUnique({ where: { name: "E-commerce" } });
  const graphisme = await prisma.skill.findUnique({ where: { name: "Graphisme" } });

  // Assign skills to users
  if (devWeb) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user1.id, skillId: devWeb.id } }, update: {}, create: { userId: user1.id, skillId: devWeb.id, level: "EXPERT" } });
  if (devMobile) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user1.id, skillId: devMobile.id } }, update: {}, create: { userId: user1.id, skillId: devMobile.id, level: "INTERMEDIAIRE" } });
  if (design) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user3.id, skillId: design.id } }, update: {}, create: { userId: user3.id, skillId: design.id, level: "EXPERT" } });
  if (graphisme) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user3.id, skillId: graphisme.id } }, update: {}, create: { userId: user3.id, skillId: graphisme.id, level: "EXPERT" } });
  if (marketing) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user2.id, skillId: marketing.id } }, update: {}, create: { userId: user2.id, skillId: marketing.id, level: "EXPERT" } });
  if (cm) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user2.id, skillId: cm.id } }, update: {}, create: { userId: user2.id, skillId: cm.id, level: "INTERMEDIAIRE" } });
  if (data) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user4.id, skillId: data.id } }, update: {}, create: { userId: user4.id, skillId: data.id, level: "INTERMEDIAIRE" } });
  if (ia) await prisma.userSkill.upsert({ where: { userId_skillId: { userId: user4.id, skillId: ia.id } }, update: {}, create: { userId: user4.id, skillId: ia.id, level: "DEBUTANT" } });

  console.log("✅ Skills assigned to users");

  // Experiences
  const experiences = [
    { userId: user1.id, title: "Développeur Full Stack Senior", company: "Djezzy Digital", location: "Alger", startDate: new Date("2021-01-01"), current: true, description: "Développement d'applications web et mobile pour 2M+ utilisateurs." },
    { userId: user1.id, title: "Développeur Web Junior", company: "StartupDZ", location: "Alger", startDate: new Date("2019-06-01"), endDate: new Date("2020-12-31"), current: false, description: "Création de plateformes e-commerce locales." },
    { userId: user3.id, title: "Lead Designer", company: "Agence Pixel Alger", location: "Alger", startDate: new Date("2022-03-01"), current: true, description: "Direction artistique et conception UI/UX pour grandes marques algériennes." },
    { userId: user2.id, title: "Co-fondatrice & CMO", company: "Souk.dz", location: "Oran", startDate: new Date("2020-09-01"), current: true, description: "Lancement et croissance d'une marketplace e-commerce algérienne." },
    { userId: user4.id, title: "Stagiaire Data Analyst", company: "Algérie Télécom", location: "Alger", startDate: new Date("2024-07-01"), endDate: new Date("2024-12-31"), current: false, description: "Analyse des données de trafic réseau et visualisation BI." },
  ];
  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }

  console.log("✅ Experiences created");

  // Create posts with tags
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      type: "OFFRE",
      title: "Développement application web React / Next.js",
      content: "Je propose mes services pour le développement d'applications web modernes. Spécialisé en React, Next.js et Node.js. Disponible pour des missions de 1 à 6 mois. Portfolio disponible sur demande. Expérience avec des entreprises algériennes (startups, PME, grandes entreprises).",
      budget: "80 000 - 150 000 DA / mois",
      duration: "1-6 mois",
      location: "Alger / Remote",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      type: "RECHERCHE",
      title: "Recherche développeur web pour notre startup e-commerce",
      content: "Notre startup Souk.dz (marketplace algérienne) recherche un développeur web confirmé pour rejoindre notre équipe. Mission : refonte complète du front-end en React/Next.js, intégration de solutions de paiement locales (CIB, Edahabia). Profil sénior préféré.",
      budget: "100 000 - 180 000 DA / mois",
      duration: "6 mois renouvelable",
      location: "Oran / Remote possible",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user3.id,
      type: "OFFRE",
      title: "Design UI/UX & Identité visuelle — Expert disponible",
      content: "Designer senior avec 4 ans d'expérience. Je propose : création d'identités visuelles, design d'interfaces web et mobile (Figma), charte graphique. Mes créations sont pensées pour le public algérien tout en respectant les standards internationaux.",
      budget: "50 000 - 100 000 DA / projet",
      duration: "Au projet",
      location: "Constantine / Remote",
    },
  });

  const post4 = await prisma.post.create({
    data: {
      userId: user2.id,
      type: "RECHERCHE",
      title: "Recherche designer pour refonte identité de marque",
      content: "Souk.dz recherche un designer talentueux pour la refonte complète de notre identité visuelle. Nous voulons un look moderne, professionnel et adapté au marché algérien. Livrables : logo, charte graphique, templates réseaux sociaux, design app mobile.",
      budget: "80 000 - 120 000 DA",
      duration: "2 mois",
      location: "Remote",
    },
  });

  const post5 = await prisma.post.create({
    data: {
      userId: user4.id,
      type: "RECHERCHE",
      title: "Cherche mission Data Science / BI",
      content: "Diplômé USTHB en Informatique, spécialité IA et Data. Je recherche une première mission sérieuse en data science ou analyse de données. Compétences : Python, Pandas, Scikit-learn, Power BI. Motivé et disponible immédiatement.",
      budget: "40 000 - 60 000 DA / mois",
      duration: "3-6 mois",
      location: "Alger",
    },
  });

  console.log("✅ Posts created");

  // Assign tags to posts
  if (devWeb) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post1.id, skillId: devWeb.id } }, update: {}, create: { postId: post1.id, skillId: devWeb.id } });
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post2.id, skillId: devWeb.id } }, update: {}, create: { postId: post2.id, skillId: devWeb.id } });
  }
  if (devMobile) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post1.id, skillId: devMobile.id } }, update: {}, create: { postId: post1.id, skillId: devMobile.id } });
  }
  if (ecom) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post2.id, skillId: ecom.id } }, update: {}, create: { postId: post2.id, skillId: ecom.id } });
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post4.id, skillId: ecom.id } }, update: {}, create: { postId: post4.id, skillId: ecom.id } });
  }
  if (design) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post3.id, skillId: design.id } }, update: {}, create: { postId: post3.id, skillId: design.id } });
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post4.id, skillId: design.id } }, update: {}, create: { postId: post4.id, skillId: design.id } });
  }
  if (graphisme) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post3.id, skillId: graphisme.id } }, update: {}, create: { postId: post3.id, skillId: graphisme.id } });
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post4.id, skillId: graphisme.id } }, update: {}, create: { postId: post4.id, skillId: graphisme.id } });
  }
  if (data) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post5.id, skillId: data.id } }, update: {}, create: { postId: post5.id, skillId: data.id } });
  }
  if (ia) {
    await prisma.postTag.upsert({ where: { postId_skillId: { postId: post5.id, skillId: ia.id } }, update: {}, create: { postId: post5.id, skillId: ia.id } });
  }

  console.log("✅ Post tags assigned");
  console.log("🎉 TalentDZ database seeded successfully!");
  console.log("\n📋 Demo accounts:");
  console.log("  karim@talentdz.dz / password123 (Expert Dev)");
  console.log("  sofia@startupdz.dz / password123 (PME)");
  console.log("  yasmine@design.dz / password123 (Designer)");
  console.log("  amine@talent.dz / password123 (Chercheur)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
