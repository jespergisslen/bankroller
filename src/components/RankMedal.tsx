// Small leaderboard-standing medal, shown in the top-left corner of an avatar.
// Only ranks 1-3 get a medal; anything else renders nothing.
// gold / silver / bronze
export const MEDAL_COLORS: Record<number, string> = {
  1: "#e6b23a",
  2: "#c3c7d0",
  3: "#cd8b53",
};

export const medalColor = (rank: number | undefined): string | undefined =>
  rank ? MEDAL_COLORS[rank] : undefined;

export function RankMedal({ rank, size = 17 }: { rank: number | undefined; size?: number }) {
  const bg = medalColor(rank);
  if (!bg || !rank) return null;
  return (
    <span
      aria-label={`Ranked #${rank} on the leaderboard`}
      style={{
        position: "absolute", top: -5, left: -5, zIndex: 1,
        width: size, height: size, borderRadius: "50%",
        background: bg, color: "#1c1c1d",
        border: "2px solid var(--bg-1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: size * 0.55, fontWeight: 700, lineHeight: 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
      }}
    >
      {rank}
    </span>
  );
}
