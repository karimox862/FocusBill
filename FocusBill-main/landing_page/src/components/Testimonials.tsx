"use client";

const testimonials = [
    {
        quote: "I used to invoice based on rough estimates. FocusBill showed me I was undercharging by nearly 30%. First month I recovered $800 I would have left on the table.",
        name: "Sarah K.",
        role: "UX Designer",
        avatar: "SK",
        stars: 5,
    },
    {
        quote: "The distraction detection is eerily accurate. I now have a real picture of how much of my 'working hours' were actually productive. Changed how I price projects.",
        name: "Marcus T.",
        role: "Freelance Developer",
        avatar: "MT",
        stars: 5,
    },
    {
        quote: "One-click invoice generation alone would be worth paying for. The live earnings counter keeps me in deep work longer than anything else I've tried.",
        name: "Priya N.",
        role: "Content Strategist",
        avatar: "PN",
        stars: 5,
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            <div className="max-w-5xl mx-auto">
                {/* Section label */}
                <div className="text-center mb-14">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#2B59E0]/50" />
                        <span className="text-[#7BA4FF] text-sm font-semibold uppercase tracking-widest">
                            What Freelancers Say
                        </span>
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#2B59E0]/50" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F0FFFB] mb-3 leading-tight tracking-tight">
                        Freelancers Are
                        <br />
                        <span className="text-gradient">Earning More.</span>
                    </h2>
                    <p className="text-[#F0FFFB]/50 text-lg max-w-md mx-auto">
                        Early beta users report reclaiming an average of $400/month in unbilled income.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="border-glow rounded-2xl p-6 bg-[#000D40]/70 backdrop-blur-sm card-hover flex flex-col gap-4"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5">
                                {Array.from({ length: t.stars }).map((_, si) => (
                                    <svg key={si} viewBox="0 0 24 24" fill="#7BA4FF" className="w-4 h-4">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-[#F0FFFB]/70 text-sm leading-relaxed flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-2 border-t border-[#F0FFFB]/8">
                                <div className="w-9 h-9 rounded-full bg-[#001A6E] border border-[#2B59E0]/40 flex items-center justify-center text-[#7BA4FF] text-xs font-bold flex-shrink-0">
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-[#F0FFFB] text-sm font-semibold">{t.name}</p>
                                    <p className="text-[#F0FFFB]/40 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust bar */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 border-t border-[#F0FFFB]/6">
                    {[
                        { label: "Average income recovered", value: "$400/mo" },
                        { label: "Beta satisfaction score", value: "4.9 / 5" },
                        { label: "Avg. billable hours gain", value: "+23%" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-black text-gradient">{stat.value}</div>
                            <div className="text-[#F0FFFB]/35 text-xs mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
