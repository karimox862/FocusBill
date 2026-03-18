"use client";

const problems = [
    {
        icon: (
            /* Hourglass draining — lost, unbillable hours */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17l2.5-3 2.5 3" />
                <line x1="16" y1="4" x2="18" y2="2" strokeLinecap="round" />
            </svg>
        ),
        headline: "You lose hours you never bill for",
        body:
            "Context switching, Slack pings, shallow tasks — they eat your day. And since you never tracked it, you never charged for it.",
    },
    {
        icon: (
            /* Dollar sign with blurred/unknown value */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v1m0 8v1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5S9.5 13 9.5 14.5h5" />
            </svg>
        ),
        headline: "No idea what your actual hourly rate is",
        body:
            "You set your rate. But after distractions, admin work, and half-focused sessions — your effective rate could be half of what you charge.",
    },
    {
        icon: (
            /* Document with erased / incomplete lines */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" d="M9 12h6" />
                <path strokeLinecap="round" strokeDasharray="2 2" d="M9 16h4" />
            </svg>
        ),
        headline: "Month-end invoicing feels like guesswork",
        body:
            "You scramble to reconstruct your week. You undercharge because you can't prove the hours. You leave money on the table — every single month.",
    },
];

export default function Problem() {
    return (
        <section id="problem" className="py-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            <div className="max-w-5xl mx-auto">
                {/* Section label */}
                <div className="flex items-center gap-3 justify-center mb-4">
                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#2B59E0]/50" />
                    <span className="text-[#7BA4FF] text-sm font-semibold uppercase tracking-widest">
                        The Problem
                    </span>
                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#2B59E0]/50" />
                </div>

                <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F0FFFB] text-center mb-4 leading-tight tracking-tight">
                    Freelancers Work More.<br />
                    <span className="text-[#F0FFFB]/50 font-normal">And Earn Less Than They Should.</span>
                </h2>
                <p className="text-[#F0FFFB]/50 text-center max-w-xl mx-auto mb-16 text-lg">
                    It&apos;s not a work ethic problem. It&apos;s an income visibility problem.
                    You can&apos;t fix what you can&apos;t see.
                </p>

                {/* Problem cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                    {problems.map((p, i) => (
                        <div
                            key={i}
                            className="border-glow rounded-2xl p-7 bg-[#000D40]/70 backdrop-blur-sm card-hover group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 group-hover:bg-red-500/15 transition-colors">
                                {p.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[#F0FFFB] mb-3 leading-tight">
                                {p.headline}
                            </h3>
                            <p className="text-[#F0FFFB]/50 text-sm leading-relaxed">{p.body}</p>
                        </div>
                    ))}
                </div>

                {/* Quote / callout */}
                <div className="mt-14 bg-[#000D40]/80 border border-[#F0FFFB]/8 rounded-2xl p-8 text-center max-w-2xl mx-auto reveal">
                    <p className="text-lg text-[#F0FFFB]/70 italic leading-relaxed">
                        &ldquo;On average, freelancers undercharge by{" "}
                        <span className="text-[#7BA4FF] font-bold not-italic">23%</span>{" "}
                        due to poor time visibility and unbilled focus time.&rdquo;
                    </p>
                    <p className="text-[#F0FFFB]/30 text-sm mt-3">
                        — Freelancer Income Clarity Report, 2024
                    </p>
                </div>
            </div>
        </section>
    );
}
