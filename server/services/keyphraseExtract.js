// RAKE-style (Rapid Automatic Keyword Extraction) keyphrase extractor.
// Used as the JD skill list when a JD doesn't fit any curated taxonomy
// domain well — no training data, no model, just word co-occurrence scoring.
// Reference: Rose et al., "Automatic Keyword Extraction from Individual
// Documents" (2010).

const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are aren't as at be because been before " +
    "being below between both but by can't cannot could couldn't did didn't do does doesn't doing " +
    "don't down during each few for from further had hadn't has hasn't have haven't having he he'd " +
    "he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into " +
    "is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only " +
    "or other ought our ours ourselves out over own same shan't she she'd she'll she's should " +
    "shouldn't so some such than that that's the their theirs them themselves then there there's " +
    "these they they'd they'll they're they've this those through to too under until up very was " +
    "wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while " +
    "who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours " +
    "yourself yourselves"
  ).split(" ")
);

// JD/resume boilerplate that acts as a phrase delimiter even though it's not
// a classic stopword — otherwise generic filler dominates the top results.
const FILLER_WORDS = new Set(
  (
    "experience years strong excellent proven demonstrated ability abilities knowledge skill skills " +
    "responsible responsibilities including etc role join team candidate looking work working " +
    "environment company opportunity required requirements preferred plus using use ensure ensuring " +
    "help build building manage managing new high highly good great must apply applicant position job " +
    "will can also well like require requires requiring seeking seek need needs needed someone"
  ).split(" ")
);

const DELIMITERS = new Set([...STOPWORDS, ...FILLER_WORDS]);

function splitIntoCandidatePhrases(text) {
  const sentences = text
    .toLowerCase()
    .split(/[.!?;:(),\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const phrases = [];
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);
    let current = [];
    for (const word of words) {
      const cleaned = word.replace(/[^a-z0-9+#./-]/g, "");
      if (!cleaned || DELIMITERS.has(cleaned)) {
        if (current.length > 0) {
          phrases.push(current);
          current = [];
        }
        continue;
      }
      current.push(cleaned);
    }
    if (current.length > 0) phrases.push(current);
  }
  return phrases;
}

function scorePhrases(phrases) {
  const freq = new Map();
  const degree = new Map();

  for (const phrase of phrases) {
    const len = phrase.length;
    for (const word of phrase) {
      freq.set(word, (freq.get(word) || 0) + 1);
      degree.set(word, (degree.get(word) || 0) + len - 1 + 1); // co-occurrences + self
    }
  }

  const wordScore = new Map();
  for (const word of freq.keys()) {
    wordScore.set(word, degree.get(word) / freq.get(word));
  }

  const phraseScores = phrases.map((phrase) => ({
    phrase: phrase.join(" "),
    words: phrase,
    score: phrase.reduce((sum, w) => sum + wordScore.get(w), 0),
  }));

  return phraseScores;
}

/**
 * Extracts ranked candidate skill/requirement phrases from free text (a JD).
 * @param {string} text
 * @param {{ maxPhrases?: number, maxWordsPerPhrase?: number, minWordLength?: number }} opts
 * @returns {string[]} phrases in original (lowercased) word order, best first
 */
export function extractKeyphrases(text, opts = {}) {
  const { maxPhrases = 15, maxWordsPerPhrase = 4, minWordLength = 3, minWordsPerPhrase = 1 } = opts;

  const candidates = splitIntoCandidatePhrases(text).filter(
    (phrase) =>
      phrase.length > 0 &&
      phrase.length <= maxWordsPerPhrase &&
      phrase.every((w) => w.length >= minWordLength || /\d/.test(w))
  );

  const scored = scorePhrases(candidates);

  const seen = new Set();
  const ranked = scored
    .sort((a, b) => b.score - a.score)
    .filter((p) => {
      if (p.words.length < minWordsPerPhrase) return false;
      if (seen.has(p.phrase)) return false;
      seen.add(p.phrase);
      return true;
    });

  return ranked.slice(0, maxPhrases).map((p) => p.phrase);
}
