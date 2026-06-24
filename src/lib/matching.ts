// Algorithme de matching MAHARAtoCOME
// Score basé sur les compétences communes entre une OFFRE et une RECHERCHE

interface PostWithTags {
  id: string;
  type: string;
  title: string;
  content: string;
  budget?: string | null;
  location?: string | null;
  user: {
    id: string;
    name: string;
    title?: string | null;
    city?: string | null;
    type: string;
  };
  tags: {
    skill: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export interface MatchResult {
  offer: PostWithTags;
  search: PostWithTags;
  score: number;
  commonSkills: string[];
  explanation: string;
}

export function calculateMatchScore(
  offer: PostWithTags,
  search: PostWithTags
): MatchResult | null {
  if (offer.type !== "OFFRE" || search.type !== "RECHERCHE") return null;

  const offerSkillIds = new Set(offer.tags.map((t) => t.skill.id));
  const searchSkillIds = new Set(search.tags.map((t) => t.skill.id));

  const commonSkillIds = [...offerSkillIds].filter((id) =>
    searchSkillIds.has(id)
  );

  if (commonSkillIds.length === 0) return null;

  const unionSize = new Set([...offerSkillIds, ...searchSkillIds]).size;
  const jaccardScore = (commonSkillIds.length / unionSize) * 100;

  // Bonus si même ville
  let locationBonus = 0;
  if (
    offer.location &&
    search.location &&
    offer.location.toLowerCase() === search.location.toLowerCase()
  ) {
    locationBonus = 10;
  }

  const finalScore = Math.min(100, Math.round(jaccardScore + locationBonus));

  const commonSkills = commonSkillIds.map(
    (id) => offer.tags.find((t) => t.skill.id === id)!.skill.name
  );

  let explanation = `${commonSkills.length} compétence(s) en commun : ${commonSkills.join(", ")}.`;
  if (locationBonus > 0) explanation += " Même ville (+10 pts).";

  return {
    offer,
    search,
    score: finalScore,
    commonSkills,
    explanation,
  };
}

export function runMatchingAlgorithm(
  posts: PostWithTags[]
): MatchResult[] {
  const offers = posts.filter((p) => p.type === "OFFRE");
  const searches = posts.filter((p) => p.type === "RECHERCHE");

  const results: MatchResult[] = [];

  for (const offer of offers) {
    for (const search of searches) {
      const match = calculateMatchScore(offer, search);
      if (match && match.score >= 20) {
        results.push(match);
      }
    }
  }

  // Trier par score décroissant
  return results.sort((a, b) => b.score - a.score);
}
