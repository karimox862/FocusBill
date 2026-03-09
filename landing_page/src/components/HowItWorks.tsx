"use client";

const steps = [
    {
        number: "01",
        title: "Install the Extension",
        description:
            "Add FocusBill to Chrome in one click. Set your default hourly rate and create your first project in under 2 minutes.",
        detail: "Works on all Chromium browsers",
    },
    {
        number: "02",
        title: "Start a Focus Session",
        description:
            "Click start when you begin a work session. FocusBill monitors your active tab, detects distraction sites, and only counts real focus time.",
        detail: "Automatic distraction detection",
    },
    {
        number: "03",
        title: "Watch Your Income Grow",
        description:
            "Your live earnings counter updates by the second. Stop a session and instantly see the billable amount — ready to add to your invoice.",
        detail: "Export-ready in one click",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#2B59E0]/50" />
                        <span className="text-[#7BA4FF] text-sm font-semibold uppercase tracking-widest">
                            How It Works
                        </span>
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#2B59E0]/50" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F0FFFB] mb-4 leading-tight tracking-tight">
                        Income Clarity in{" "}
                        <span className="text-gradient">3 Simple Steps</span>
                    </h2>
                    <p className="text-[#F0FFFB]/50 text-lg max-w-lg mx-auto">
                        No complex setup. No complicated dashboards. Just install, focus,
                        and get paid what you&apos;re worth.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-[52px] left-[16.666%] right-[16.666%] h-px bg-gradient-to-r from-[#001A6E]/30 via-[#2B59E0]/50 to-[#001A6E]/30" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
                        {steps.map((step, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center group">
                                {/* Number bubble */}
                                <div className="relative w-16 h-16 rounded-2xl bg-[#001A6E]/60 border border-[#F0FFFB]/15 flex items-center justify-center mb-6 group-hover:border-[#2B59E0]/60 group-hover:shadow-lg group-hover:shadow-[#2B59E0]/20 transition-all duration-300 z-10">
                                    <span className="text-2xl font-black text-gradient">{step.number}</span>
                                </div>

                                {/* Content card */}
                                <div className="border-glow rounded-2xl p-6 bg-[#000D40]/60 backdrop-blur-sm w-full card-hover">
                                    <h3 className="text-xl font-bold text-[#F0FFFB] mb-3">{step.title}</h3>
                                    <p className="text-[#F0FFFB]/50 text-sm leading-relaxed mb-4">
                                        {step.description}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 bg-[#001A6E]/50 rounded-full px-3 py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#7BA4FF] inline-block" />
                                        <span className="text-[#7BA4FF] text-xs font-medium">{step.detail}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teaser UI mockup */}
                <div className="mt-16 border-glow rounded-2xl p-6 bg-[#000D40]/80 backdrop-blur-sm max-w-md mx-auto reveal">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#001A6E] border border-[#F0FFFB]/15 flex items-center justify-center">
                                <span className="text-[#F0FFFB] text-xs font-bold">F</span>
                            </div>
                            <span className="text-[#F0FFFB] font-semibold text-sm">FocusBill</span>
                        </div>
                        <span className="bg-[#001A6E]/60 text-[#7BA4FF] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#2B59E0]/30">
                            ● LIVE
                        </span>
                    </div>

                    <div className="text-center py-4">
                        <p className="text-[#F0FFFB]/30 text-xs uppercase tracking-widest mb-1">
                            Current Session Earnings
                        </p>
                        <div className="text-5xl font-black text-gradient mb-1">$47.25</div>
                        <p className="text-[#F0FFFB]/40 text-sm">
                            1h 33m focused @ $30/hr
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="bg-[#001A6E]/40 rounded-xl p-3">
                            <div className="text-[#F0FFFB] font-bold text-base">3.2h</div>
                            <div className="text-[#F0FFFB]/35 text-xs mt-0.5">Today</div>
                        </div>
                        <div className="bg-[#001A6E]/40 rounded-xl p-3">
                            <div className="text-[#F0FFFB] font-bold text-base">$96</div>
                            <div className="text-[#F0FFFB]/35 text-xs mt-0.5">Today&apos;s Earn</div>
                        </div>
                        <div className="bg-[#001A6E]/40 rounded-xl p-3">
                            <div className="text-[#F0FFFB] font-bold text-base">87%</div>
                            <div className="text-[#F0FFFB]/35 text-xs mt-0.5">Focus Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
