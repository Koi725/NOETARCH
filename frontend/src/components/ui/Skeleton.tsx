"use client";

// Per-section skeleton screens matched to each surface's real layout. These render inside
// a labelled role="status" wrapper provided by the screen, so the shapes themselves are
// decorative (aria-hidden). Shimmer is animation, so it is automatically static when the
// motion toggle is OFF or prefers-reduced-motion (global gate in motion.css).
import "@/tailwind/components/Skeleton/Skeleton.css";

function Bar({ w = "100%", h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <span className="no-skel" style={{ width: w, height: h, borderRadius: r }} />;
}

function repeat(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function EvidenceListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="no-skel-wrap no-skel-evidence" aria-hidden="true">
      <div className="no-skel-row-between">
        <Bar w={220} h={22} />
        <Bar w={120} h={18} />
      </div>
      <Bar w="100%" h={38} r={8} />
      <div className="no-skel-chips">
        {repeat(5).map((i) => (
          <Bar key={i} w={72} h={26} r={999} />
        ))}
      </div>
      <div className="no-skel-list">
        {repeat(rows).map((i) => (
          <div key={i} className="no-skel-ev-row">
            <div className="no-skel-stack">
              <Bar w="70%" h={14} />
              <Bar w="45%" h={11} />
            </div>
            <div className="no-skel-row-right">
              <Bar w={80} h={22} r={999} />
              <div className="no-skel-dots">
                {repeat(3).map((j) => (
                  <Bar key={j} w={18} h={18} r={999} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TodaySkeleton() {
  return (
    <div className="no-skel-wrap no-skel-today" aria-hidden="true">
      <Bar w={280} h={26} />
      <Bar w="55%" h={14} />
      <div className="no-skel-today-grid">
        <div className="no-skel-col">
          <div className="no-skel-card no-skel-card--tall" />
          <div className="no-skel-card no-skel-card--tall" />
          <div className="no-skel-two">
            <div className="no-skel-card" />
            <div className="no-skel-card" />
          </div>
        </div>
        <div className="no-skel-col">
          <div className="no-skel-card" />
          <div className="no-skel-card" />
          <div className="no-skel-card" />
        </div>
      </div>
    </div>
  );
}

export function LiveRunSkeleton({ steps = 9 }: { steps?: number }) {
  return (
    <div className="no-skel-wrap no-skel-liverun" aria-hidden="true">
      <div className="no-skel-row-between">
        <Bar w={260} h={22} />
        <Bar w={180} h={30} r={8} />
      </div>
      <div className="no-skel-kpis">
        {repeat(4).map((i) => (
          <div key={i} className="no-skel-card no-skel-card--kpi" />
        ))}
      </div>
      <div className="no-skel-liverun-body">
        <div className="no-skel-rail">
          {repeat(steps).map((i) => (
            <div key={i} className="no-skel-rail-step">
              <Bar w={18} h={18} r={999} />
              <Bar w="60%" h={12} />
            </div>
          ))}
        </div>
        <div className="no-skel-card no-skel-card--tall" />
      </div>
    </div>
  );
}

export function HistorySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="no-skel-wrap no-skel-history" aria-hidden="true">
      <Bar w={260} h={22} />
      <div className="no-skel-chips">
        {repeat(5).map((i) => (
          <Bar key={i} w={84} h={30} r={8} />
        ))}
      </div>
      <div className="no-skel-list">
        {repeat(rows).map((i) => (
          <div key={i} className="no-skel-history-row">
            <Bar w={18} h={18} r={999} />
            <div className="no-skel-stack no-skel-grow">
              <Bar w="55%" h={14} />
              <Bar w="80%" h={11} />
            </div>
            <Bar w={90} h={30} r={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProviderGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="no-skel-wrap no-skel-policy" aria-hidden="true">
      <Bar w={240} h={24} />
      <Bar w="60%" h={13} />
      <div className="no-skel-provider-grid">
        {repeat(cards).map((i) => (
          <div key={i} className="no-skel-card no-skel-card--provider" />
        ))}
      </div>
    </div>
  );
}

export function DecisionsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="no-skel-wrap no-skel-decisions" aria-hidden="true">
      <Bar w={180} h={26} />
      <Bar w="40%" h={13} />
      <div className="no-skel-list">
        {repeat(cards).map((i) => (
          <div key={i} className="no-skel-card no-skel-card--decision" />
        ))}
      </div>
    </div>
  );
}

export function RecipesSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="no-skel-wrap no-skel-recipes" aria-hidden="true">
      <Bar w={320} h={22} />
      <div className="no-skel-recipe-grid">
        {repeat(cards).map((i) => (
          <div key={i} className="no-skel-card no-skel-card--recipe" />
        ))}
      </div>
    </div>
  );
}

export function GuidedReviewSkeleton() {
  return (
    <div className="no-skel-wrap no-skel-gr" aria-hidden="true">
      <div className="no-skel-row-between">
        <Bar w={260} h={22} />
        <Bar w={150} h={28} r={8} />
      </div>
      <Bar w="100%" h={10} r={999} />
      <div className="no-skel-gr-body">
        <div className="no-skel-card no-skel-card--tall" />
        <div className="no-skel-card no-skel-card--tall" />
      </div>
    </div>
  );
}
