"use client";

export default function CTA() {
    return (
        <section id="install" className="py-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            {/* Background glow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-[0.08]"
                style={{ background: "radial-gradient(ellipse, #2B59E0, transparent 65%)" }}
            />

            <div className="max-w-2xl mx-auto text-center relative z-10">
                {/* Chrome badge */}
                <div className="inline-flex items-center gap-2 bg-[#001A6E]/50 border border-[#F0FFFB]/12 px-4 py-1.5 rounded-full mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    <span className="text-[#F0FFFB]/80 text-sm font-medium">
                        Available now — <span className="text-[#7BA4FF] font-semibold">free forever</span>
                    </span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F0FFFB] mb-4 leading-tight tracking-tight">
                    Stop Leaving Money
                    <br />
                    <span className="text-gradient">On the Table.</span>
                </h2>

                <p className="text-[#F0FFFB]/50 text-lg mb-10 max-w-lg mx-auto">
                    Join{" "}
                    <span className="text-[#F0FFFB] font-semibold">2,400+ freelancers</span>{" "}
                    who use FocusBill to know exactly what their focused work is
                    earning them — in real time.
                </p>

                {/* Install CTA */}
                <div className="flex flex-col items-center gap-4">
                    {/* TODO: Replace href with actual Chrome Web Store URL once published */}
                    <a
                        href="https://chrome.google.com/webstore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary px-10 py-5 rounded-2xl text-lg font-semibold flex items-center gap-3 glow-brand"
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Install FocusBill — It&apos;s Free</span>
                    </a>
                    <p className="text-[#F0FFFB]/30 text-sm">
                        Chrome, Edge, Brave & all Chromium browsers · No sign-up needed
                    </p>
                </div>

                {/* Perks */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {[
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" />
                                </svg>
                            ),
                            title: "Free Forever",
                            desc: "All core features are free. No hidden paywalls, no trial limits.",
                        },
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            ),
                            title: "Set Up in 2 Minutes",
                            desc: "Install, set your rate, and start your first session — no configuration needed.",
                        },
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <path d="M12 2l8 3v6c0 4.97-3.525 9.38-8 10.93C7.525 20.38 4 15.97 4 11V5l8-3z" /><path d="M9 12l2 2 4-4" />
                                </svg>
                            ),
                            title: "Private & Secure",
                            desc: "Your data stays on your device. No tracking, no cloud required.",
                        },
                    ].map((perk, i) => (
                        <div key={i} className="border-glow rounded-xl p-4 bg-[#000D40]/60 flex gap-3 items-start">
                            <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-[#001A6E]/60 border border-[#2B59E0]/30 flex items-center justify-center">
                                {perk.icon}
                            </span>
                            <div>
                                <p className="text-[#F0FFFB] text-sm font-semibold">{perk.title}</p>
                                <p className="text-[#F0FFFB]/40 text-xs mt-0.5 leading-relaxed">{perk.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
