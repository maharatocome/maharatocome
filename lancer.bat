@echo off
chcp 65001 >nul
title MAHARAtoCOME — Installation et lancement

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║         MAHARAtoCOME — Setup et lancement        ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: ─────────────────────────────────────────────────────
:: ETAPE 1 — Vérification de Node.js
:: ─────────────────────────────────────────────────────
echo  [1/5] Vérification de Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ╔══════════════════════════════════════════════════════════╗
    echo  ║  Node.js n'est pas installé sur ce PC.                   ║
    echo  ║                                                          ║
    echo  ║  Téléchargez et installez Node.js v20 LTS ici :         ║
    echo  ║  https://nodejs.org/en/download                          ║
    echo  ║                                                          ║
    echo  ║  Après l'installation, relancez ce fichier .bat          ║
    echo  ╚══════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
FOR /F "tokens=*" %%v IN ('node -v') DO SET NODE_VERSION=%%v
echo     Node.js détecté : %NODE_VERSION%

:: ─────────────────────────────────────────────────────
:: ETAPE 2 — Installation des dépendances npm
:: ─────────────────────────────────────────────────────
echo.
echo  [2/5] Installation des dépendances (npm install)...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo  ERREUR : npm install a échoué.
    pause
    exit /b 1
)
echo     Dépendances installées avec succès.

:: ─────────────────────────────────────────────────────
:: ETAPE 3 — Génération du client Prisma
:: ─────────────────────────────────────────────────────
echo.
echo  [3/5] Génération du client Prisma...
call npx prisma generate
IF %ERRORLEVEL% NEQ 0 (
    echo  ERREUR : prisma generate a échoué.
    pause
    exit /b 1
)
echo     Client Prisma généré.

:: ─────────────────────────────────────────────────────
:: ETAPE 4 — Création de la base de données
:: ─────────────────────────────────────────────────────
echo.
echo  [4/5] Initialisation de la base de données...
IF EXIST "prisma\dev.db" (
    echo     Base de données existante détectée — aucune action requise.
) ELSE (
    echo     Création de la base de données et des tables...
    call npx prisma db push
    IF %ERRORLEVEL% NEQ 0 (
        echo  ERREUR : prisma db push a échoué.
        pause
        exit /b 1
    )
    echo     Chargement des données initiales...
    call npx prisma db seed
    IF %ERRORLEVEL% NEQ 0 (
        echo  ERREUR : prisma db seed a échoué.
        pause
        exit /b 1
    )
    echo     Base de données prête.
)

:: ─────────────────────────────────────────────────────
:: ETAPE 5 — Lancement du serveur
:: ─────────────────────────────────────────────────────
echo.
echo  [5/5] Lancement du serveur...
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║   Application disponible sur :                   ║
echo  ║   http://localhost:3000                          ║
echo  ║                                                  ║
echo  ║   Appuyez sur Ctrl+C pour arrêter le serveur    ║
echo  ╚══════════════════════════════════════════════════╝
echo.

call npm run dev
