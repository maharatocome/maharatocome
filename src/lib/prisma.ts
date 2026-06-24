import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  walEnabled: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

globalForPrisma.prisma = prisma;

// WAL mode SQLite : permet lectures et écritures simultanées
// PRAGMA retourne des résultats en SQLite donc on utilise $queryRawUnsafe
if (!globalForPrisma.walEnabled) {
  globalForPrisma.walEnabled = true;
  prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;")
    .then(() => prisma.$queryRawUnsafe("PRAGMA synchronous=NORMAL;"))
    .then(() => prisma.$queryRawUnsafe("PRAGMA busy_timeout=5000;"))
    .catch(() => {});
}
