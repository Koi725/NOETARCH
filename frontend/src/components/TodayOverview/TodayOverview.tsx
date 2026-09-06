"use client";

import Link from "next/link";
import { useShell } from "@/components/ApplicationShell";
import { useTheme } from "@/components/ThemeProvider";
import { todayData } from "@/data/TodayOverview/TodayOverview-data";
import "@/tailwind/components/TodayOverview/TodayOverview.css";

type ComingSoonActionProps = {
  children: React.ReactNode;
  className: string;
  label: string;
};

function ComingSoonAction({ children, className, label }: ComingSoonActionProps) {
  return (
    <button className={`${className} no-coming-soon-action`} type="button" disabled aria-label={`${label} — coming soon`}>
      <span>{children}</span>
      <span className="no-coming-soon-label" aria-hidden="true">Coming soon</span>
    </button>
  );
}

export function TodayOverview() {
  const { plain } = useTheme();
  const { openPalette } = useShell();

  return (
    <div className="no-today-page">
      <header className="no-today-header">
        <div>
          <div className="no-eyebrow no-today-eyebrow">Workspace · this device</div>
          <h1>{todayData.project}</h1>
          <p>{todayData.question}</p>
          <div className="no-prototype-notice" role="note">Prototype · Mock data</div>
        </div>
        <div className="no-today-actions">
          <Link className="no-primary-button" href="/guided-review">Start a review</Link>
          <button className="no-secondary-button" type="button" onClick={openPalette}>⌘K</button>
        </div>
      </header>

      {plain && (
        <div className="no-plain-band">
          <span className="no-plain-mark" aria-hidden="true" />
          <p><strong>In plain words:</strong> this page is a status board. It shows what the computer is doing for you right now, what it needs you to decide, and what it finished. Nothing is sent to the internet without you pressing a button first.</p>
        </div>
      )}

      <div className="no-today-body-grid">
        <div className="no-today-main-column">
          <section className="no-today-section no-waiting-section" aria-labelledby="waiting-heading">
            <div className="no-section-heading">
              <span className="no-section-status no-section-status-warn" aria-hidden="true" />
              <h2 id="waiting-heading">Waiting on you</h2>
              <span className="no-section-meta">2 decisions · oldest 4 min</span>
            </div>
            <div className="no-waiting-card">
              <div className="no-card-row">
                <div>
                  <h3>{todayData.waiting.title}</h3>
                  <p>{todayData.waiting.detail}</p>
                </div>
                <div className="no-card-actions">
                  <Link className="no-secondary-button" href="/decisions">Look closer</Link>
                  <Link className="no-warn-button" href="/decisions">Decide</Link>
                </div>
              </div>
              <div className="no-card-footer">Also waiting: <span>{todayData.waiting.next}</span> · stays on device · $0.00</div>
            </div>
          </section>

          <section className="no-today-section" aria-labelledby="happening-heading">
            <div className="no-section-heading">
              <span className="no-section-status no-section-status-live" aria-hidden="true" />
              <h2 id="happening-heading">Happening now</h2>
            </div>
            <Link className="no-run-card" href="/live-run" aria-label="Watch the active literature run">
              <div className="no-run-main">
                <h3>{todayData.run.title}</h3>
                <div className="no-run-meta">{todayData.run.meta}</div>
                <div className="no-run-current"><span>Step 5 of 9</span> · removing duplicate papers</div>
                <div className="no-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={todayData.run.progress} aria-label="Run progress">
                  <span className="no-progress-fill" style={{ width: `${todayData.run.progress}%` }} />
                  <span className="no-progress-sweep" aria-hidden="true" />
                </div>
                <div className="no-step-strip" aria-label="Four steps complete, one running, one waiting, three queued">
                  {["done", "done", "done", "done", "live", "waiting", "queued", "queued", "queued"].map((state, index) => <span className={`no-step-segment is-${state}`} key={`${state}-${index}`} />)}
                </div>
              </div>
              <div className="no-run-kpis">
                {todayData.run.kpis.map(([label, value, tone]) => <div className="no-kpi" key={label}><div className="no-kpi-label">{label}</div><div className={`no-kpi-value${tone ? ` is-${tone}` : ""}`}>{value}</div></div>)}
              </div>
            </Link>
          </section>

          <section className="no-today-lower-grid" aria-label="Recent status">
            <article className="no-failure-card">
              <div className="no-card-kicker">One source failed</div>
              <div className="no-failure-body">
                <h3>{todayData.failure.title}</h3>
                <p>{todayData.failure.body}</p>
                <div className="no-card-actions">
                  <ComingSoonAction className="no-secondary-button" label="Try that step again">Try that step again</ComingSoonAction>
                  <Link className="no-secondary-button" href="/history">See where it stopped</Link>
                </div>
              </div>
            </article>
            <article className="no-finished-card">
              <div className="no-card-kicker">Finished recently</div>
              <div>
                {todayData.finished.map(([title, meta, cost], index) => <div className={`no-finished-row${index < todayData.finished.length - 1 ? " has-divider" : ""}`} key={title}><div><div className="no-finished-title">{title}</div><div className="no-finished-meta">{meta}</div></div><div className={`no-finished-cost${index === 0 ? " is-ok" : ""}`}>{cost}</div></div>)}
              </div>
            </article>
          </section>
        </div>

        <aside className="no-today-aside" aria-label="Workspace details">
          <section>
            <div className="no-aside-heading">Sources right now</div>
            <div className="no-source-stack">
              {todayData.sources.map(([name, state, tone]) => <div className="no-source-row" key={name}><span className={`no-status-dot no-status-${tone}`} aria-hidden="true" /><span>{name}</span><span className={`no-source-state is-${tone}`}>{state}</span></div>)}
            </div>
            <p className="no-aside-note">Semantic Scholar has been unavailable for 11 minutes. Runs that need it wait in line — they don&apos;t fail.</p>
          </section>

          <section>
            <div className="no-aside-heading">Files made today</div>
            <div className="no-file-list">
              {todayData.files.map(([name, meta, pending]) => <div className={`no-file-row${pending ? " is-pending" : ""}`} key={name}><div>{name}</div><span>{meta}</span></div>)}
            </div>
          </section>

          <section className="no-data-location">
            <div className="no-aside-heading">Where your data is</div>
            <p>Everything stays in <span>~/NOETARCH/i5-0-review</span>. The only thing that ever leaves is what you approve at step 6.</p>
            <Link className="no-secondary-button" href="/models-policy">Change what&apos;s allowed</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
