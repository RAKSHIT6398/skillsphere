// AI matching: HuggingFace embeddings (if key exists) + skill-cosine fallback
import User from "../models/User.js";
import Gig from "../models/Gig.js";

const skillVector = (skills, vocab) => vocab.map((s) => (skills.includes(s) ? 1 : 0));
const cosine = (a, b) => {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const mA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const mB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return mA && mB ? dot / (mA * mB) : 0;
};

export const hfSimilarity = async (source, sentences) => {
  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { source_sentence: source, sentences } }),
      }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

// Recommend freelancers for a gig
export const matchFreelancersForGig = async (gig, limit = 10) => {
  const query = { role: "freelancer", isSuspended: false };
  let freelancers = await User.find(query).select("name avatar skills reputationScore hourlyRate location isVerifiedBadge");

  const gigSkills = gig.skillsRequired.map((s) => s.toLowerCase());
  const vocab = [...new Set([...gigSkills, ...freelancers.flatMap((f) => f.skills.map((s) => s.name.toLowerCase()))])];
  const gigVec = skillVector(gigSkills, vocab);

  // Optional semantic score via HuggingFace
  const hfScores = await hfSimilarity(
    `${gig.title} ${gig.skillsRequired.join(" ")}`,
    freelancers.map((f) => `${f.skills.map((s) => s.name).join(" ")}`)
  );

  const scored = freelancers.map((f, i) => {
    const fSkills = f.skills.map((s) => s.name.toLowerCase());
    const skillScore = cosine(gigVec, skillVector(fSkills, vocab));
    const semantic = hfScores ? hfScores[i] : skillScore;
    const repScore = Math.min(f.reputationScore / 5, 1);
    // distance boost (hyperlocal)
    let distScore = 0;
    if (gig.location?.coordinates && f.location?.coordinates) {
      const [lng1, lat1] = gig.location.coordinates;
      const [lng2, lat2] = f.location.coordinates;
      const d = Math.sqrt((lng1 - lng2) ** 2 + (lat1 - lat2) ** 2);
      distScore = Math.max(0, 1 - d / 2);
    }
    const finalScore = 0.45 * semantic + 0.15 * skillScore + 0.25 * repScore + 0.15 * distScore;
    return { freelancer: f, score: +finalScore.toFixed(3) };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

// Recommend gigs for a freelancer
export const matchGigsForFreelancer = async (user, limit = 10) => {
  const gigs = await Gig.find({ status: "open" }).populate("client", "name avatar");
  const mySkills = user.skills.map((s) => s.name.toLowerCase());
  const scored = gigs.map((g) => {
    const gs = g.skillsRequired.map((s) => s.toLowerCase());
    const overlap = gs.filter((s) => mySkills.includes(s)).length;
    const score = gs.length ? overlap / gs.length : 0;
    return { gig: g, score: +score.toFixed(3) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

// Trending skills
export const trendingSkills = async () => {
  const agg = await Gig.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 864e5) } } },
    { $unwind: "$skillsRequired" },
    { $group: { _id: { $toLower: "$skillsRequired" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  return agg.map((a) => ({ skill: a._id, count: a.count }));
};