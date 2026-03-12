import { Fraunces, Manrope, Space_Grotesk } from 'next/font/google';

const editorial = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-editorial',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});

type Concept = {
  slug: string;
  name: string;
  tag: string;
  summary: string;
  palette: { label: string; value: string }[];
  shell: string;
  panel: string;
  panelAlt: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  headingFont: string;
  titleClass: string;
  heroGlow: string;
  chips: string[];
  customerHighlights: string[];
  adminMetrics: { label: string; value: string; delta: string }[];
  driverStops: { label: string; detail: string; eta: string }[];
};

const concepts: Concept[] = [
  {
    slug: 'warm-premium',
    name: 'Warm Premium Marketplace',
    tag: 'Editorial food-first',
    summary:
      'A richer, chef-led identity with layered cards, soft paper tones, and premium product storytelling.',
    palette: [
      { label: 'Shell', value: '#F7F2EA' },
      { label: 'Surface', value: '#FFF9F2' },
      { label: 'Text', value: '#221C17' },
      { label: 'Accent', value: '#C96A2B' },
      { label: 'Olive', value: '#788A49' },
      { label: 'Border', value: '#E4D6C8' },
    ],
    shell: '#F7F2EA',
    panel: '#FFF9F2',
    panelAlt: '#F1E6D6',
    text: '#221C17',
    muted: '#73685E',
    accent: '#C96A2B',
    accentSoft: '#F0D6BF',
    border: '#E4D6C8',
    headingFont: 'var(--font-editorial)',
    titleClass: 'tracking-tight',
    heroGlow:
      'radial-gradient(circle at top right, rgba(201,106,43,0.23), transparent 42%), radial-gradient(circle at left 30%, rgba(120,138,73,0.18), transparent 32%)',
    chips: ['Chef stories', 'Premium photography', 'Trust markers', 'Layered editorial sections'],
    customerHighlights: ['Tonight’s tasting menus', 'Neighborhood favourites', 'Chef pickup in 19 min'],
    adminMetrics: [
      { label: 'Gross volume', value: '$18.4K', delta: '+14% dinner rush' },
      { label: 'Prep risk', value: '03', delta: '2 late kitchens' },
      { label: 'VIP retention', value: '92%', delta: 'stable repeat rate' },
    ],
    driverStops: [
      { label: 'Pickup', detail: 'Maison Noura, King West', eta: '4 min' },
      { label: 'Drop 1', detail: 'Ava. condo concierge', eta: '11 min' },
      { label: 'Drop 2', detail: 'Miles. house handoff', eta: '18 min' },
    ],
  },
  {
    slug: 'bold-urban',
    name: 'Bold Urban Delivery',
    tag: 'Fast operational grid',
    summary:
      'A sharper delivery identity with bolder hierarchy, stronger KPI framing, and a logistics-forward visual language.',
    palette: [
      { label: 'Shell', value: '#F3F5F7' },
      { label: 'Surface', value: '#FFFFFF' },
      { label: 'Text', value: '#0E141B' },
      { label: 'Accent', value: '#FF5A36' },
      { label: 'Support', value: '#0F766E' },
      { label: 'Panel', value: '#182028' },
    ],
    shell: '#F3F5F7',
    panel: '#FFFFFF',
    panelAlt: '#182028',
    text: '#0E141B',
    muted: '#5B6672',
    accent: '#FF5A36',
    accentSoft: '#FFD2C9',
    border: '#D6DDE5',
    headingFont: 'var(--font-display)',
    titleClass: 'uppercase tracking-[0.2em]',
    heroGlow:
      'linear-gradient(135deg, rgba(255,90,54,0.15), transparent 45%), linear-gradient(315deg, rgba(15,118,110,0.12), transparent 45%)',
    chips: ['Fast scan panels', 'KPI-heavy layouts', 'Compact controls', 'Route urgency states'],
    customerHighlights: ['Heat-ready meals', 'Courier ETA guarantee', 'Live order pulse'],
    adminMetrics: [
      { label: 'Live orders', value: '148', delta: '+9 in last 10 min' },
      { label: 'Driver utilization', value: '84%', delta: 'healthy zone' },
      { label: 'Dispatch lag', value: '01:42', delta: '-18 sec vs avg' },
    ],
    driverStops: [
      { label: 'Pickup', detail: 'Steel Pan Kitchen', eta: '2 min' },
      { label: 'Traffic gate', detail: 'Richmond closure reroute', eta: '+3 min' },
      { label: 'Drop', detail: 'Office tower lobby code 1884', eta: '9 min' },
    ],
  },
  {
    slug: 'trust-community',
    name: 'Trust-First Local Community',
    tag: 'Friendly, high clarity',
    summary:
      'A calmer neighborhood identity with accessible spacing, reassurance messaging, and cleaner onboarding paths.',
    palette: [
      { label: 'Shell', value: '#F8FBF8' },
      { label: 'Surface', value: '#FFFFFF' },
      { label: 'Text', value: '#163126' },
      { label: 'Accent', value: '#2E7D5A' },
      { label: 'Highlight', value: '#F2C14E' },
      { label: 'Muted', value: '#DCE9E2' },
    ],
    shell: '#F8FBF8',
    panel: '#FFFFFF',
    panelAlt: '#E8F2EC',
    text: '#163126',
    muted: '#607565',
    accent: '#2E7D5A',
    accentSoft: '#D8ECDC',
    border: '#DCE9E2',
    headingFont: 'var(--font-sans)',
    titleClass: 'tracking-tight',
    heroGlow:
      'radial-gradient(circle at top left, rgba(46,125,90,0.14), transparent 40%), radial-gradient(circle at right 30%, rgba(242,193,78,0.18), transparent 28%)',
    chips: ['High readability', 'Neighborhood safety cues', 'Accessible hierarchy', 'Confidence-first onboarding'],
    customerHighlights: ['Verified kitchens', 'Allergy notes upfront', 'Support always visible'],
    adminMetrics: [
      { label: 'Satisfaction', value: '4.8/5', delta: '412 recent reviews' },
      { label: 'Issue response', value: '5 min', delta: 'median support reply' },
      { label: 'Refund risk', value: 'Low', delta: '2 orders flagged' },
    ],
    driverStops: [
      { label: 'Pickup', detail: 'Sunnydale Family Meals', eta: '6 min' },
      { label: 'Support note', detail: 'Customer requests side-door drop', eta: 'read' },
      { label: 'Completion', detail: 'Photo confirmation + thank-you flow', eta: '12 min' },
    ],
  },
];

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
      style={{ borderColor: color, color }}
    >
      {children}
    </span>
  );
}

export default function DesignLabPage() {
  return (
    <div
      className={`${editorial.variable} ${sans.variable} ${display.variable} min-h-screen`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(243,242,239,0.9) 65%, rgba(235,233,228,0.92))',
        color: '#151515',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <header className="overflow-hidden rounded-[32px] border border-black/10 bg-white/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel color="#AA4B23">Ride & Dine Design Sprint</SectionLabel>
              <h1
                className="mt-5 max-w-4xl text-4xl leading-none sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                Three visual directions for customer, admin, and driver surfaces.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-black/65 sm:text-lg">
                These are implementation-ready concept boards, not abstract moodboards.
                Each direction shows a customer-facing marketplace, an admin control surface,
                and a driver flow so Replit has concrete starting points.
              </p>
            </div>

            <div className="grid gap-3 rounded-[26px] bg-neutral-950 p-5 text-white sm:grid-cols-3 lg:min-w-[480px]">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Priority</p>
                <p className="mt-2 text-2xl font-semibold">Appeal</p>
                <p className="mt-1 text-sm text-white/70">Food desirability and trust must rise together.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Constraint</p>
                <p className="mt-2 text-2xl font-semibold">Replit-friendly</p>
                <p className="mt-1 text-sm text-white/70">Single-source implementation path, no design dead ends.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Goal</p>
                <p className="mt-2 text-2xl font-semibold">Role clarity</p>
                <p className="mt-1 text-sm text-white/70">Customer, admin, and driver each need a stronger screen logic.</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          {concepts.map((concept) => (
            <section
              key={concept.slug}
              className="overflow-hidden rounded-[36px] border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-8"
              style={{
                background: concept.shell,
                borderColor: concept.border,
                color: concept.text,
                backgroundImage: concept.heroGlow,
              }}
            >
              <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
                <div className="flex flex-col gap-6">
                  <div className="rounded-[30px] border p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" style={{ background: concept.panel, borderColor: concept.border }}>
                    <div className="flex flex-wrap items-center gap-3">
                      <SectionLabel color={concept.accent}>{concept.tag}</SectionLabel>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                        style={{ background: concept.accentSoft, color: concept.accent }}
                      >
                        Concept {concept.slug === 'warm-premium' ? '01' : concept.slug === 'bold-urban' ? '02' : '03'}
                      </span>
                    </div>
                    <h2
                      className={`mt-5 text-4xl sm:text-5xl ${concept.titleClass}`}
                      style={{ fontFamily: concept.headingFont }}
                    >
                      {concept.name}
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7" style={{ color: concept.muted }}>
                      {concept.summary}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {concept.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border px-3 py-2 text-sm"
                          style={{ borderColor: concept.border, color: concept.text, background: concept.panelAlt }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-[30px] border p-6" style={{ background: concept.panel, borderColor: concept.border }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.26em]" style={{ color: concept.muted }}>
                        Color system
                      </h3>
                      <span className="text-sm" style={{ color: concept.muted }}>
                        Initial token set
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {concept.palette.map((swatch) => (
                        <div key={swatch.label} className="rounded-[22px] border p-3" style={{ borderColor: concept.border }}>
                          <div className="h-20 rounded-[16px]" style={{ background: swatch.value }} />
                          <p className="mt-3 text-sm font-semibold">{swatch.label}</p>
                          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: concept.muted }}>
                            {swatch.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border p-6" style={{ background: concept.panel, borderColor: concept.border }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.26em]" style={{ color: concept.muted }}>
                        Why this works
                      </h3>
                      <span className="text-sm font-semibold" style={{ color: concept.accent }}>
                        Starting direction
                      </span>
                    </div>
                    <ul className="mt-4 grid gap-3 text-sm leading-7">
                      {concept.customerHighlights.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full"
                            style={{ background: concept.accent }}
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-6">
                  <article
                    className="overflow-hidden rounded-[30px] border shadow-[0_28px_50px_rgba(0,0,0,0.08)]"
                    style={{ background: concept.panel, borderColor: concept.border }}
                  >
                    <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: concept.border }}>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                          Customer experience
                        </p>
                        <h3 className="mt-1 text-xl font-semibold">Marketplace landing screen</h3>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: concept.accentSoft, color: concept.accent }}>
                        Consumer-facing
                      </span>
                    </div>

                    <div className="grid gap-6 p-6 lg:grid-cols-[1.08fr_0.92fr]">
                      <div className="rounded-[28px] p-6" style={{ background: concept.panelAlt }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                              Tonight near Queen West
                            </p>
                            <h4 className="mt-2 text-3xl font-semibold" style={{ fontFamily: concept.headingFont }}>
                              Meals worth leaving the apps open for.
                            </h4>
                          </div>
                          <div
                            className="grid h-16 w-16 place-items-center rounded-[20px] text-xl font-bold"
                            style={{ background: concept.accent, color: '#fff' }}
                          >
                            RD
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          {['Chef pickup 12 min', 'Tracked delivery', 'Allergy filters'].map((pill) => (
                            <div
                              key={pill}
                              className="rounded-[18px] border px-4 py-3 text-sm font-medium"
                              style={{ borderColor: concept.border, background: concept.panel }}
                            >
                              {pill}
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          {[
                            { title: 'Jerk chicken bowl', meta: 'Asha • 4.9 • 18 min', price: '$19' },
                            { title: 'Braised short rib', meta: 'Noura • 4.8 • 22 min', price: '$26' },
                          ].map((item, index) => (
                            <div
                              key={item.title}
                              className="overflow-hidden rounded-[24px] border"
                              style={{ borderColor: concept.border, background: concept.panel }}
                            >
                              <div
                                className="h-36"
                                style={{
                                  background:
                                    index === 0
                                      ? `linear-gradient(135deg, ${concept.accentSoft}, ${concept.panelAlt})`
                                      : `linear-gradient(135deg, ${concept.panelAlt}, ${concept.accentSoft})`,
                                }}
                              />
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h5 className="text-lg font-semibold">{item.title}</h5>
                                    <p className="mt-1 text-sm" style={{ color: concept.muted }}>
                                      {item.meta}
                                    </p>
                                  </div>
                                  <span className="text-lg font-semibold" style={{ color: concept.accent }}>
                                    {item.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[24px] border p-4" style={{ borderColor: concept.border, background: concept.panelAlt }}>
                          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                            Conversion levers
                          </p>
                          <div className="mt-4 grid gap-3">
                            {['Urgent pickup badges', 'Chef trust panel', 'Live ETAs beside prices'].map((item) => (
                              <div key={item} className="rounded-[18px] px-4 py-3 text-sm font-medium" style={{ background: concept.panel }}>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[24px] border p-4" style={{ borderColor: concept.border }}>
                          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                            Layout notes
                          </p>
                          <p className="mt-3 text-sm leading-7" style={{ color: concept.muted }}>
                            Hero messaging, discovery rails, and the first two menu cards all stay above the fold. The
                            screen is structured to make trust and appetite visible before scrolling.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <article
                      className="overflow-hidden rounded-[30px] border shadow-[0_22px_40px_rgba(0,0,0,0.08)]"
                      style={{ background: concept.panel, borderColor: concept.border }}
                    >
                      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: concept.border }}>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                            Admin surface
                          </p>
                          <h3 className="mt-1 text-lg font-semibold">Dispatch + operations overview</h3>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: concept.accentSoft, color: concept.accent }}>
                          Control room
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                          {concept.adminMetrics.map((metric) => (
                            <div key={metric.label} className="rounded-[22px] border p-4" style={{ borderColor: concept.border, background: concept.panelAlt }}>
                              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                                {metric.label}
                              </p>
                              <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                              <p className="mt-2 text-sm" style={{ color: concept.accent }}>
                                {metric.delta}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 overflow-hidden rounded-[24px] border" style={{ borderColor: concept.border }}>
                          <div className="grid grid-cols-[1.2fr_0.9fr_0.7fr] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ borderColor: concept.border, color: concept.muted, background: concept.panelAlt }}>
                            <span>Kitchen</span>
                            <span>Order queue</span>
                            <span>Risk</span>
                          </div>
                          {[
                            ['Asha Kitchen', '12 live orders', 'Low'],
                            ['Maison Noura', '4 orders delayed', 'Watch'],
                            ['Steel Pan', '18 live orders', 'High'],
                          ].map((row) => (
                            <div key={row[0]} className="grid grid-cols-[1.2fr_0.9fr_0.7fr] gap-3 px-4 py-4 text-sm" style={{ borderTop: `1px solid ${concept.border}` }}>
                              <span className="font-semibold">{row[0]}</span>
                              <span style={{ color: concept.muted }}>{row[1]}</span>
                              <span style={{ color: row[2] === 'High' ? concept.accent : concept.text }}>{row[2]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>

                    <article
                      className="overflow-hidden rounded-[30px] border shadow-[0_22px_40px_rgba(0,0,0,0.08)]"
                      style={{ background: concept.panel, borderColor: concept.border }}
                    >
                      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: concept.border }}>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: concept.muted }}>
                            Driver surface
                          </p>
                          <h3 className="mt-1 text-lg font-semibold">Active delivery mission</h3>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: concept.accentSoft, color: concept.accent }}>
                          Mobile-first
                        </span>
                      </div>

                      <div className="p-6">
                        <div
                          className="rounded-[28px] border p-4"
                          style={{
                            borderColor: concept.border,
                            background:
                              concept.slug === 'bold-urban'
                                ? 'linear-gradient(160deg, #1B242D, #131A20)'
                                : concept.panelAlt,
                            color: concept.slug === 'bold-urban' ? '#F8FBFF' : concept.text,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] opacity-70">Current route</p>
                              <h4 className="mt-2 text-2xl font-semibold">2 stops, 18 minutes total</h4>
                            </div>
                            <div
                              className="rounded-full px-4 py-2 text-sm font-semibold"
                              style={{ background: concept.accent, color: '#fff' }}
                            >
                              Live
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3">
                            {concept.driverStops.map((stop, index) => (
                              <div
                                key={stop.label}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[20px] px-4 py-3"
                                style={{
                                  background: concept.slug === 'bold-urban' ? 'rgba(255,255,255,0.06)' : concept.panel,
                                }}
                              >
                                <div
                                  className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold"
                                  style={{ background: concept.accentSoft, color: concept.accent }}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold">{stop.label}</p>
                                  <p className="text-sm opacity-75">{stop.detail}</p>
                                </div>
                                <span className="text-sm font-semibold">{stop.eta}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
