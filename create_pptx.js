const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'output');

let pres = new pptxgen();

// Define master slide layout
pres.layout = 'LAYOUT_16x9';

// Helper to add a slide with text and image
function addSlide(title, text, imagePath) {
    let slide = pres.addSlide();
    
    slide.addText(title, { x: 0.5, y: 0.5, w: '90%', h: 0.8, fontSize: 28, bold: true, color: '111827' });
    
    slide.addText(text, { x: 0.5, y: 1.5, w: '35%', h: 4, fontSize: 16, color: '4B5563', align: 'left', valign: 'top' });
    
    if (imagePath) {
        slide.addImage({ path: imagePath, x: 4.5, y: 1.5, w: 8, h: 5.5, sizing: { type: 'contain' } });
    }
}

// Slide 1: Introduction and Added Value
let slide1 = pres.addSlide();
slide1.addText("MAHARAtoCOME", { x: 0.5, y: 1.5, w: '90%', fontSize: 44, bold: true, color: '4F46E5', align: 'center' });
slide1.addText("L'application qui connecte les talents algériens au marché de manière directe et intelligente.\n\nContrairement à LinkedIn qui est un réseau social généraliste saturé de bruit, MAHARAtoCOME se concentre exclusivement sur les collaborations concrètes. L'application met instantanément en relation les besoins des entreprises et les compétences des experts grâce à un algorithme précis, sans distraction.", { x: 1.5, y: 3.0, w: 7, fontSize: 18, color: '111827', align: 'center' });

// Slide 2: Accueil
addSlide(
    "Une Vision Publique Claire",
    "Les visiteurs sont immédiatement accueillis par une interface professionnelle qui va droit au but. Ils accèdent directement aux offres concrètes et aux recherches de compétences actives sur le marché algérien, sans avoir à faire défiler un fil d'actualité générique.",
    path.join(OUT_DIR, 'home_logged_out.png')
);

// Slide 3: Authentification
addSlide(
    "Un Accès Simplifié",
    "La connexion est conçue pour être rapide et ciblée pour des profils spécifiques comme les experts ou les startups. L'objectif est de faire entrer l'utilisateur dans un véritable espace de travail productif.",
    path.join(OUT_DIR, 'login.png')
);

// Slide 4: Dashboard
addSlide(
    "Un Espace de Travail Efficace",
    "Une fois connecté, l'utilisateur dispose d'un tableau de bord complet. D'un côté, il gère son profil et ses correspondances. De l'autre, il observe les tendances du marché. Tout est pensé pour l'action et la recherche du partenaire idéal.",
    path.join(OUT_DIR, 'home_logged_in.png')
);

// Slide 5: Création
addSlide(
    "Des Publications Précises",
    "Publier un besoin ou proposer un service se fait en quelques instants. L'utilisation obligatoire de mots-clés de compétences garantit que chaque annonce est qualifiée et prête à être traitée par notre algorithme. L'information ne se perd jamais.",
    path.join(OUT_DIR, 'create_post.png')
);

// Slide 6: Matching
addSlide(
    "L'Intelligence au Service du Recrutement",
    "C'est ici que se trouve notre grande force par rapport aux plateformes traditionnelles. L'application calcule automatiquement un score de compatibilité entre les annonces. Nous créons la connexion de manière proactive, ce qui fait gagner de précieuses heures de recherche.",
    path.join(OUT_DIR, 'matching.png')
);

// Slide 7: Profil
addSlide(
    "Un Portfolio Concret",
    "Le profil utilisateur agit comme un curriculum vitae moderne et structuré, centré sur les aptitudes réelles et les expériences. Il permet aux recruteurs et aux partenaires d'évaluer le potentiel d'un talent en un seul coup d'œil.",
    path.join(OUT_DIR, 'profile.png')
);

// Slide 8: Perspectives
let slide8 = pres.addSlide();
slide8.addText("Perspectives d'Amélioration", { x: 0.5, y: 0.5, w: '90%', h: 0.8, fontSize: 28, bold: true, color: '111827' });
slide8.addText("L'application continuera d'évoluer avec l'intégration d'un système de messagerie en temps réel pour faciliter les premiers échanges entre collaborateurs.\n\nDe plus, l'ajout de tests de compétences certifiés permettra de garantir le niveau des experts.\n\nDes abonnements exclusifs seront proposés aux entreprises souhaitant mettre en avant leurs annonces, accompagnés d'un tableau de bord analytique pour suivre la visibilité de leur profil et le succès de leurs correspondances.", { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 18, color: '4B5563', align: 'left', valign: 'top' });

// Save the presentation
const outPath = path.join(OUT_DIR, 'MAHARAtoCOME_Presentation.pptx');
pres.writeFile({ fileName: outPath }).then(fileName => {
    console.log('Presentation created: ' + fileName);
}).catch(err => {
    console.error('Error creating presentation: ' + err);
});
