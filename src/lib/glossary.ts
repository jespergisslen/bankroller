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
      "A unit is just a fixed slice of your bankroll, usually around 1%. Bet in units instead of cash and two things happen: your stakes scale automatically as the bankroll grows or shrinks, and your history stays readable. \"+40 units over the season\" means something. \"+$250\" means nothing unless you also know what you were staking back then.",
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
  {
    slug: "yield-vs-roi",
    term: "Yield vs ROI",
    group: "Staking & bankroll",
    oneLiner: "Two ways to measure profit. Yield is per unit staked; ROI gets used more loosely. Knowing which one someone quotes you matters.",
    body: [
      "Someone tells you they're \"up 30%\" and we all nod like it means something. Then you realise half the time people mean yield and half the time they mean something else entirely.",
      "Yield is net profit divided by total amount staked. Stake 100 units across a season, finish 8 up, that's 8% yield. It respects how much risk you actually pushed through the market, which is why it's the honest number for a tipster.",
      "ROI gets used more loosely: sometimes per bet, sometimes on starting bankroll, sometimes as a synonym for yield. None of that is wrong, but it means \"my ROI is 40%\" tells you very little until you ask what it's measured against. When in doubt, ask for yield and the number of bets behind it.",
    ],
    sharpNote: "A huge yield on 20 bets is noise. A modest yield over a thousand is a career. Always read the sample size next to the percentage.",
    related: ["units", "closing-line-value"],
  },
  {
    slug: "kelly-criterion",
    term: "Kelly Criterion",
    group: "Staking & bankroll",
    oneLiner: "A staking formula that sizes each bet by your edge to maximise long-term growth without going broke.",
    body: [
      "Most of us find Kelly the hard way: betting too big on a good thing, watching variance take a bite, and wishing we'd had a rule.",
      "The Kelly criterion sizes your stake by how much edge you actually have and the odds on offer. Bigger edge, bigger bet; thin edge, small bet. Done properly it grows a bankroll faster than flat staking over the long run, and it never tells you to risk everything.",
      "The catch is it assumes you know your true edge, and almost nobody does. Overestimate it and full Kelly swings get brutal. That's why most people who use it bet a fraction, half or quarter Kelly, trading a little growth for a lot less heartburn.",
    ],
    sharpNote: "Full Kelly is mathematically optimal and emotionally unbearable. Fractional Kelly exists because we're human and bankrolls are real.",
    related: ["units", "variance"],
  },
  {
    slug: "variance",
    term: "Variance",
    group: "Staking & bankroll",
    oneLiner: "The swings around your true expectation. Why a winning strategy can lose for months, and a bad one can look brilliant for a while.",
    body: [
      "Variance is the thing that lets a coin-flip bettor go on a heater and feel like a genius, and a genuinely sharp one stare at a red graph for two months.",
      "Even with a real edge, results scatter around your expectation in the short run. Win streaks and cold runs aren't signals that your method started or stopped working; they're the normal noise of a probabilistic game. The edge only shows once the sample is big enough to drown the noise out.",
      "This is why we keep coming back to closing line value and large samples. They're a couple of the few things that tell you something true while variance is busy lying to you about everything else.",
    ],
    sharpNote: "The dangerous moment isn't the downswing, it's the upswing. That's when people decide they've \"figured it out\" and start betting bigger, right before variance regresses.",
    related: ["closing-line-value", "kelly-criterion"],
  },
  {
    slug: "vig-juice",
    term: "Vig / Juice",
    group: "Pricing & markets",
    oneLiner: "The bookmaker's built-in margin. The reason a coin flip pays less than even money on both sides.",
    body: [
      "The first edge you ever have to beat isn't the other bettors or the bookmaker's models. It's the vig, quietly baked into every price you see.",
      "Vig (or juice) is the margin the book adds so the odds add up to more than 100% implied probability. A fair coin flip is 2.00 each side; a book might offer 1.91 each way. That gap is their cut, win or lose.",
      "It sounds small until you realise you pay it on every single bet. Beating a market doesn't just mean being right more than half the time, it means being right often enough to clear the vig first. Shopping for the lowest-margin books is one of the easiest edges going.",
    ],
    sharpNote: "Low-vig books like Pinnacle make money on volume, not on fleecing you. Higher-margin books look generous on promos and claw it back in the prices.",
    related: ["overround", "closing-line-value"],
  },
  {
    slug: "overround",
    term: "Overround",
    group: "Pricing & markets",
    oneLiner: "The total implied probability of a market once you add every outcome up. Anything over 100% is the book's margin.",
    body: [
      "Add up the implied probabilities of every outcome in a market and you'd expect 100%. It never is, and the gap is the whole game.",
      "Convert each price to its implied probability (1 divided by the odds) and sum them. A two-way market priced 1.91 / 1.91 comes to about 105%. That extra 5% is the overround, the same thing as the vig, just viewed from the market's side rather than a single bet's.",
      "Comparing overrounds tells you instantly which book is tighter. A match priced at 102% total is a sharper, fairer market than the same one at 109%, and over a season that difference is most of your profit or loss.",
    ],
    sharpNote: "When a market's overround suddenly tightens near kickoff, it's usually sharp money arriving. That move is worth more attention than any pundit's pick.",
    related: ["vig-juice", "expected-value"],
  },
  {
    slug: "expected-value",
    term: "Expected Value",
    abbr: "EV",
    group: "Pricing & markets",
    oneLiner: "What a bet is worth on average if you could place it a thousand times. Positive EV is the whole point.",
    body: [
      "Every bet we make is really a bet on a number we can't see: its expected value. Get that number positive often enough and the results take care of themselves.",
      "EV is what you'd win or lose per bet on average if you could repeat it endlessly. If you reckon something is genuinely 50% to happen and you can back it at 2.10, that's positive EV: you're getting paid more than the true odds. Back the same thing at 1.80 and you're lighting money on fire, even when it wins.",
      "The hard part isn't the formula, it's honestly estimating the true probability. That's where research, models and discipline live. Closing line value is basically EV's receipt: keep beating the close and your EV estimates were probably real.",
    ],
    sharpNote: "A losing bet can be a good bet and a winning bet can be a terrible one. EV judges the decision, not the outcome. Train yourself to think that way and most of the tilt disappears.",
    related: ["closing-line-value", "vig-juice"],
  },
  {
    slug: "quarter-ball-lines",
    term: "Quarter-ball lines",
    group: "Bet types",
    oneLiner: "Asian lines ending in .25 or .75 that split your stake across two outcomes, giving half wins and half losses.",
    body: [
      "Quarter-ball lines are the reason your bet slip sometimes says \"half won\" and you go hunting for a bug that isn't there.",
      "A line like +0.75 or Over 2.25 isn't a single bet, it's two half-stakes at the neighbouring half and whole lines. +0.75 is half at +0.5 and half at +1.0. Depending on the result, both halves can win, both can lose, or one wins while the other pushes, which is where half win and half loss come from.",
      "They exist so the market can price something between two lines. If +0.5 is too short and +1.0 is too generous, +0.75 is the in-between, and your risk is split to match.",
    ],
    sharpNote: "Logging these as a plain win or loss quietly corrupts your yield. Grade the half results properly or your record drifts from reality.",
    related: ["asian-handicap", "units"],
  },
  {
    slug: "1x2",
    term: "1X2",
    group: "Bet types",
    oneLiner: "The classic three-way market: home win, draw, or away win. Simple to read, which is exactly why the draw is where value hides.",
    body: [
      "1X2 is the first market any of us ever bet, and the one we spend years learning to actually read.",
      "It's just the three outcomes of a match: 1 for the home win, X for the draw, 2 for the away win. No handicaps, no half goals. The simplicity is the appeal and the trap, because casual money piles onto favourites and big names, leaving the draw and the unfashionable side mispriced more often than you'd think.",
      "When you want to express \"I don't think the favourite wins\" without picking exactly how, the draw and the Asian handicap are usually cleaner tools than a straight 1X2 punt.",
    ],
    sharpNote: "Public money on 1X2 leans heavily to home favourites at the weekend. Draws are chronically underbet, which is exactly why they're worth a second look.",
    related: ["asian-handicap", "expected-value"],
  },
  {
    slug: "steam-move",
    term: "Steam move",
    group: "Sharp life",
    oneLiner: "A sudden, market-wide odds move as serious money hits. Following it late is usually a trap.",
    body: [
      "You spot a price crashing across every book at once and your instinct screams \"get on before it's gone\". That instinct has cost a lot of us money.",
      "A steam move is a fast, coordinated shift in the odds, usually sharp syndicate money or a model firing all at once. It tells you where the smart money went, which is genuinely useful information.",
      "The problem is timing. By the time you see the steam, the value that caused it is usually already gone, and you're taking the worse price the move created. Chasing steam is how you end up betting into closed value. Better to treat it as a signal for next time than to jump on the tail end.",
    ],
    sharpNote: "Originating steam beats chasing it. Find the move before the market does and you're the sharp money. Follow it and you're often the exit liquidity.",
    related: ["closing-line-value", "getting-limited"],
  },
  {
    slug: "getting-limited",
    term: "Getting limited",
    group: "Sharp life",
    oneLiner: "When a book cuts your stakes or closes your account because you win too consistently. A backhanded compliment with real consequences.",
    body: [
      "There's a strange milestone in a bettor's life: the day a book decides you're too good and quietly shrinks your max stake to pocket change. It stings and flatters in equal measure.",
      "Most recreational books profit from losing customers, so they watch for winners and the patterns that come with them: beating the closing line, betting odd amounts, jumping on moves early. Get flagged and you might be limited to tiny stakes or shut down entirely.",
      "It's the uncomfortable reality of being good at this. Sharp bettors spread action across many books, lean on sharper books that welcome volume, and try not to look like a bot. None of it is glamorous, but it's the difference between an edge you can use and one you can only admire.",
    ],
    sharpNote: "Round-number stakes and not piling on the instant a price moves both help you fly under the radar a little longer. Looking human buys you time.",
    related: ["steam-move", "closing-line-value"],
  },
  {
    slug: "arbing-vs-value",
    term: "Arbing vs value betting",
    group: "Sharp life",
    oneLiner: "Two different games: arbing locks in a guaranteed small profit across books; value betting takes priced-in edges and rides the variance.",
    body: [
      "People lump arbing and value betting together because both involve hunting good prices, but they're almost opposite temperaments.",
      "Arbing (arbitrage) means backing every outcome across different books at prices that guarantee a small profit whatever happens. No variance, no opinion, just spotting the gap and acting fast. The downside: profits are thin, the windows close in seconds, and books limit arbers quickly.",
      "Value betting means backing a single outcome you believe is underpriced, and accepting that you'll lose plenty of individual bets. More variance, more judgement, and a higher ceiling if your read on probabilities is good. Most long-term winners lean on value; arbing is more of a low-risk grind.",
    ],
    sharpNote: "Arbing gets you limited about as fast as winning does, because the betting patterns look identical to the book. Either way you're playing the \"don't look too good too fast\" game.",
    related: ["getting-limited", "expected-value"],
  },
];

export function allTerms(): GlossaryTerm[] {
  return TERMS;
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return TERMS.find((t) => t.slug === slug);
}
