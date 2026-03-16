"use client";

import { useEffect, useState } from "react";

function LiveEarningsCounter() {
    const [earnings, setEarnings] = useState(47.25);
    const [time, setTime] = useState({ h: 1, m: 33, s: 0 });

    useEffect(() => {
        const rate = 30; // per hour
        const interval = setInterval(() => {
            setEarnings((prev) => parseFloat((prev + rate / 3600).toFixed(4)));
            setTime((prev) => {
                const totalSecs = prev.h * 3600 + prev.m * 60 + prev.s + 1;
                return {
                    h: Math.floor(totalSecs / 3600),
                    m: Math.floor((totalSecs % 3600) / 60),
                    s: totalSecs % 60,
                };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="border border-[#F0FFFB]/12 rounded-2xl bg-[#000D40]/90 backdrop-blur-md overflow-hidden shadow-2xl shadow-[#001A6E]/30 w-full max-w-sm mx-auto">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#F0FFFB]/8 bg-[#00091F]/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-[#F0FFFB]/30 text-xs font-medium tracking-wide">FocusBill Extension</span>
                </div>
                <span className="flex items-center gap-1.5 bg-[#001A6E]/60 border border-[#2B59E0]/30 text-[#7BA4FF] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7BA4FF] animate-pulse inline-block" />
                    LIVE
                </span>
            </div>

            {/* Client + task row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0FFFB]/6">
                <div className="w-8 h-8 rounded-lg bg-[#001A6E] flex items-center justify-center text-[#7BA4FF] text-xs font-bold">AC</div>
                <div>
                    <p className="text-[#F0FFFB] text-xs font-semibold">Acme Corp</p>
                    <p className="text-[#F0FFFB]/40 text-[10px]">Landing page redesign</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-[#7BA4FF] text-xs font-semibold">{pad(time.h)}:{pad(time.m)}:{pad(time.s)}</p>
                    <p className="text-[#F0FFFB]/30 text-[10px]">elapsed</p>
                </div>
            </div>

            {/* Main earnings display */}
            <div className="px-4 py-5 text-center">
                <p className="text-[#F0FFFB]/30 text-[10px] uppercase tracking-widest mb-1">Session Earnings</p>
                <div className="text-5xl font-black text-gradient tabular-nums">${earnings.toFixed(2)}</div>
                <p className="text-[#F0FFFB]/35 text-xs mt-2">@ $30/hr · 100% focus</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                <div className="bg-[#001A6E]/40 rounded-xl p-2.5 text-center">
                    <p className="text-[#F0FFFB] font-bold text-sm">3.2h</p>
                    <p className="text-[#F0FFFB]/35 text-[10px] mt-0.5">Today</p>
                </div>
                <div className="bg-[#001A6E]/40 rounded-xl p-2.5 text-center">
                    <p className="text-[#F0FFFB] font-bold text-sm">$96</p>
                    <p className="text-[#F0FFFB]/35 text-[10px] mt-0.5">Earned</p>
                </div>
                <div className="bg-[#001A6E]/40 rounded-xl p-2.5 text-center">
                    <p className="text-[#7BA4FF] font-bold text-sm">94%</p>
                    <p className="text-[#F0FFFB]/35 text-[10px] mt-0.5">Focus</p>
                </div>
            </div>

            {/* Action row */}
            <div className="flex gap-2 px-4 pb-4">
                <button className="flex-1 py-2 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold">
                    Stop
                </button>
                <button className="flex-1 py-2 rounded-lg bg-[#2B59E0]/30 border border-[#2B59E0]/40 text-[#7BA4FF] text-xs font-semibold">
                    Invoice →
                </button>
            </div>
        </div>
    );
}

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background orbs */}
            <div
                className="orb w-[700px] h-[700px] top-[-200px] left-[-250px]"
                style={{ background: "rgba(0,26,110,0.3)" }}
            />
            <div
                className="orb w-[500px] h-[500px] bottom-[-100px] right-[-150px]"
                style={{
                    background: "rgba(43,89,224,0.15)",
                    animationDelay: "3s",
                    animationDirection: "alternate-reverse",
                }}
            />

            {/* Grid lines background */}
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(240,255,251,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(240,255,251,0.8) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Copy */}
                    <div className="text-center lg:text-left">
                        {/* Available now badge */}
                        <div className="inline-flex items-center gap-2 bg-[#001A6E]/40 border border-[#F0FFFB]/15 px-4 py-1.5 rounded-full mb-8 animate-fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                            <span className="text-[#7BA4FF] text-sm font-medium tracking-wide">
                                Now Available on Chrome Web Store
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6 animate-fade-up delay-100">
                            <span className="text-[#F0FFFB]">You Work Hard.</span>
                            <br />
                            <span className="text-gradient">Do You Know</span>
                            <br />
                            <span className="text-[#F0FFFB]">What You Earn?</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-[#F0FFFB]/60 max-w-xl mb-10 leading-relaxed animate-fade-up delay-200">
                            FocusBill tracks every focused minute and converts it into{" "}
                            <span className="text-[#7BA4FF] font-semibold">real billable income</span>{" "}
                            — in real time. Finally, clarity on what your deep work is worth.
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-up delay-300">
                            <a
                                href="#install"
                                className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2.5 glow-brand"
                            >
                                <span>Install Free — Chrome Web Store</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <p className="text-[#F0FFFB]/40 text-sm">
                                Free forever · No account required
                            </p>
                        </div>

                        {/* Social proof — compact */}
                        <div className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-6 animate-fade-up delay-400">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#F0FFFB]">2,400+</div>
                                <div className="text-[#F0FFFB]/40 text-xs mt-0.5">Freelancers Using FocusBill</div>
                            </div>
                            <div className="w-px h-8 bg-[#F0FFFB]/10 hidden sm:block" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#F0FFFB]">$890K+</div>
                                <div className="text-[#F0FFFB]/40 text-xs mt-0.5">Billable Hours Tracked</div>
                            </div>
                            <div className="w-px h-8 bg-[#F0FFFB]/10 hidden sm:block" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#F0FFFB]">4.9★</div>
                                <div className="text-[#F0FFFB]/40 text-xs mt-0.5">Beta Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live product preview */}
                    <div className="animate-fade-up delay-300 flex flex-col items-center gap-6">
                        <LiveEarningsCounter />

                        {/* Floating annotation */}
                        <div className="flex items-center gap-2 text-[#7BA4FF]/70 text-xs">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                            <span>Live preview — earnings update every second</span>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="mt-16 flex justify-center animate-fade-in delay-600">
                    <div className="flex flex-col items-center gap-2 text-[#F0FFFB]/25">
                        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            className="w-5 h-5 animate-bounce"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
