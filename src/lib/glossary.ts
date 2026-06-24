// Betting glossary — written in a relaxed, seasoned-bettor voice (we/us, warm,
// no jargon-for-jargon's-sake). Each term is its own page for SEO/GEO; the first
// paragraph doubles as an X-post hook. Add new terms by appending to TERMS.

export interface GlossaryTerm {
  slug: string;
  term: string;
  abbr?: string;
  group: string;
  oneLiner: string;        // used in cards, meta description, and DefinedTerm schema
  body: string[];          // paragraphs
  sharpNote?: string;      // "Sharp's note" callout
  related?: string[];      // slugs
}

export const TERMS: GlossaryTerm[] = [
  {
    slug: "closing-line-value",
    term: "Closing Line Value",
    abbr: "CLV",
    group: "Pricing & markets",
    oneLiner:
      "Whether you consistently beat the odds the market settles on. The single best predictor of long-term profit.",
    body: [
      "It took us longer than it should have to really get this: if you took 2.10 and the price closed at 1.85, you did the right thing, no matter how it played out on the pitch.",
      "Early on we all stare at win rate. It feels good to be right. But over a short run, results are mostly noise. The thing that actually tells you whether you'll make money long term is whether you consistently get better odds than where the market settles. That's CLV.",
      "Think of the closing line, Pinnacle's especially, as the market's sharpest guess once all the money and information are in. Beat it regularly and you've got an edge, even on the nights everything bounces the wrong way. Win but never beat it? You're living on variance, and variance isn't something you can budget around.",
    ],
    sharpNote:
      "A common trap is chasing CLV on low-liquidity markets where the closing line itself is junk. CLV only means something against a sharp price.",
    related: ["units", "asian-handicap"],
  },
  {
    slug: "units",
    term: "Units",
    group: "Staking & bankroll",
    oneLiner:
      "Betting in fixed slices of your bankroll instead of cash, so stakes scale with you and your records stay comparable.",
    body: [
      "We've all blown a good month by suddenly betting amounts that had nothing to do with the size of our bankroll. Units are the fix, and they're boring on purpose.",
      "A unit is just a fixed slice of your bankroll, usually around 1%. Bet in units instead of cash and two things happen: your stakes scale automatically as the bankroll grows or shrinks, and your history stays readable. \"+40 units over the season\" means something. \"+4,200 kr\" means nothing unless you also know what you were staking back then.",
      "Most people settle around 1 to 2 units on a normal play and save the bigger sizes for the spots they're genuinely confident in. The exact number matters less than picking one and sticking to it.",
    ],
    sharpNote:
      "Quietly bumping your unit size to chase a loss is the fastest way to turn a small downswing into a real one. The unit only works if it stays fixed.",
    related: ["yield-vs-roi", "closing-line-value"],
  },
  {
    slug: "asian-handicap",
    term: "Asian Handicap",
    group: "Bet types",
    oneLiner:
      "A goal handicap that removes the draw and can split your stake across two lines, giving half-win and half-loss outcomes.",
    body: [
      "The first time a bet got graded as a \"half loss\", most of us assumed something had glitched. It hadn't. That's just how Asian handicaps work, and once it clicks they're one of the cleaner ways to back a side.",
      "An Asian handicap gives one team a head start (or a deficit) in goals and takes the draw off the table. Whole lines like -1 can push, with your stake refunded, if the result lands exactly on the number. Quarter lines like +0.75 split your stake across two handicaps at once: half at +0.5 and half at +1.0.",
      "So if you back a team at +0.75 and they lose by exactly one goal, half your stake loses (the +0.5 part) and half is refunded (the +1.0 part pushes). That's a half loss. The same logic gives you half wins on the other side.",
    ],
    sharpNote:
      "Quarter lines are a way to take a position you're only half-sure of. If you'd want the full +1 but the price is better at +0.5, the +0.75 split is the honest middle.",
    related: ["units", "closing-line-value"],
  },
];

export function allTerms(): GlossaryTerm[] {
  return TERMS;
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return TERMS.find((t) => t.slug === slug);
}
