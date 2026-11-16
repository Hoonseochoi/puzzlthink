/** Angular corner shards behind a game page. `tint` colors the solid ones (벽바둑 red by default). */
export default function WallGoShards({ tint = '#7a1019' }: { tint?: string }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <g fill={tint} opacity="0.55">
        <polygon points="0,100 0,82 9,88 5,100" />
        <polygon points="91,0 100,0 100,14 95,7" />
        <polygon points="96,100 100,90 100,100" />
      </g>
      <g fill="#2a2b33" opacity="0.7">
        <polygon points="3,0 14,0 7,9" />
        <polygon points="88,100 100,84 100,93 93,100" />
      </g>
      <g fill="none" stroke="#9aa3b5" strokeWidth="0.15" opacity="0.45">
        <polygon points="12,6 17,3 15,12" />
        <polygon points="10,78 16,74 14,84" />
        <polygon points="85,10 90,14 86,19" />
        <polygon points="84,86 89,89 85,95" />
      </g>
    </svg>
  );
}
