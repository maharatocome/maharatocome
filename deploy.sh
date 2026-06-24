#!/bin/bash
# ============================================================
# MAHARAtoCOME — Script de déploiement sur le serveur
# À exécuter sur le serveur via SSH, dans le dossier du projet
# ============================================================

set -e  # Arrêter si une commande échoue

echo ""
echo "=================================================="
echo "  MAHARAtoCOME — Déploiement Production"
echo "=================================================="
echo ""

# 1. Installation des dépendances
echo "[1/5] Installation des dépendances..."
npm install
echo "    OK"

# 2. Génération du client Prisma
echo ""
echo "[2/5] Génération du client Prisma..."
npx prisma generate
echo "    OK"

# 3. Migration de la base de données
echo ""
echo "[3/5] Migration base de données PostgreSQL..."
npx prisma db push
echo "    OK"

# 4. Build Next.js
echo ""
echo "[4/5] Build de l'application..."
npm run build

# 5. Copier les fichiers statiques dans standalone
echo ""
echo "[5/5] Copie des fichiers statiques..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
mkdir -p logs
echo "    OK"

echo ""
echo "=================================================="
echo "  Build terminé ! Lancement avec PM2..."
echo "=================================================="
echo ""

# Redémarrer ou démarrer PM2
if pm2 list | grep -q "maharatocome"; then
    pm2 restart maharatocome
    echo "  App redémarrée avec PM2."
else
    pm2 start ecosystem.config.js
    pm2 save
    echo "  App démarrée avec PM2."
fi

echo ""
echo "  Vérifiez le statut : pm2 status"
echo "  Voir les logs      : pm2 logs maharatocome"
echo ""
