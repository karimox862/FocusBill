"use client";

const benefits = [
    {
        icon: (
            /* Coin/dollar with upward spark — live earnings accumulating */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <circle cx="12" cy="13" r="7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v1m0 4v1m-1.5-3.5a1.5 1.5 0 003 0 1.5 1.5 0 00-3 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V3m-2 1l2-2 2 2" />
            </svg>
        ),
        title: "Live Income Meter",
        description:
            "Watch your earnings accumulate as you work. Every focused minute translates directly to a dollar amount based on your rate.",
    },
    {
        icon: (
            /* Gauge/speedometer — your true effective rate */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1118 0" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l3.5-5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <path strokeLinecap="round" d="M7 17h2M15 17h2" />
            </svg>
        ),
        title: "True Effective Rate",
        description:
            "See your real effective hourly rate after accounting for idle time, interruptions, and shallow work. Know your true worth.",
    },
    {
        icon: (
            /* Receipt with checkmark — one-click invoice */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 2v20l3-2 2 2 2-2 2 2 2-2 2 2 3-2V2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l2 2 4-4" />
                <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
            </svg>
        ),
        title: "One-Click Invoice Ready",
        description:
            "Export clean, professional invoices directly from your tracked sessions. No more scrambling at month-end.",
    },
    {
        icon: (
            /* Shield with X — blocks distractions */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 3v6c0 4.97-3.525 9.38-8 10.93C7.525 20.38 4 15.97 4 11V5l8-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
            </svg>
        ),
        title: "Distraction Detection",
        description:
            "FocusBill detects when you've drifted to social media or news sites and pauses billing. You only charge for real focus.",
    },
    {
        icon: (
            /* Ascending bar chart — weekly earnings growth */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <rect x="3" y="14" width="4" height="7" rx="1" strokeLinecap="round" />
                <rect x="10" y="9" width="4" height="12" rx="1" strokeLinecap="round" />
                <rect x="17" y="4" width="4" height="17" rx="1" strokeLinecap="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
            </svg>
        ),
        title: "Weekly Earnings Reports",
        description:
            "Get a clear breakdown of what you earned this week vs last — and where your focus time generated the most income.",
    },
    {
        icon: (
            /* Stacked layers — multiple clients/rates */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5" />
            </svg>
        ),
        title: "Multi-Project Billing Rates",
        description:
            "Set different hourly rates per project or client. FocusBill tracks income separately for each, so you always know the breakdown.",
    },
];

export default function Solution() {
    return (
        <section id="solution" className="py-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            {/* Background accent */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06]"
                style={{ background: "radial-gradient(ellipse, #2B59E0, transparent 70%)" }}
            />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#2B59E0]/50" />
                        <span className="text-[#7BA4FF] text-sm font-semibold uppercase tracking-widest">
                            The Solution
                        </span>
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#2B59E0]/50" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F0FFFB] mb-4 leading-tight tracking-tight">
                        Every Focused Minute,
                        <br />
                        <span className="text-gradient">Turned Into Visible Income.</span>
                    </h2>
                    <p className="text-[#F0FFFB]/50 text-lg max-w-xl mx-auto">
                        FocusBill runs silently in your browser. No setup friction. Just
                        immediate clarity on what you&apos;re actually earning.
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                    {benefits.map((b, i) => (
                        <div
                            key={i}
                            className="border-glow rounded-2xl p-6 bg-[#000D40]/60 backdrop-blur-sm card-hover group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#001A6E]/60 border border-[#F0FFFB]/10 flex items-center justify-center text-[#7BA4FF] mb-4 group-hover:bg-[#001A6E] transition-colors">
                                {b.icon}
                            </div>
                            <h3 className="text-base font-bold text-[#F0FFFB] mb-2">{b.title}</h3>
                            <p className="text-[#F0FFFB]/50 text-sm leading-relaxed">{b.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
