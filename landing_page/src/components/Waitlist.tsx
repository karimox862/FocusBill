"use client";

import { useState, FormEvent } from "react";

const STORAGE_KEY = "focusbill_waitlist";

interface WaitlistEntry {
    email: string;
    timestamp: string;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Waitlist() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmed = email.trim();

        if (!trimmed) {
            setError("Please enter your email address.");
            return;
        }

        if (!isValidEmail(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 900));

        try {
            const existing: WaitlistEntry[] = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (existing.some((e) => e.email.toLowerCase() === trimmed.toLowerCase())) {
                setError("This email is already on the waitlist!");
                setLoading(false);
                return;
            }

            const newEntry: WaitlistEntry = {
                email: trimmed,
                timestamp: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newEntry]));

            /*
             * ─────────────────────────────────────────────────────────────
             * TO CONNECT TO A REAL BACKEND:
             * const response = await fetch("/api/waitlist", {
             *   method: "POST",
             *   headers: { "Content-Type": "application/json" },
             *   body: JSON.stringify({ email: trimmed }),
             * });
             * if (!response.ok) throw new Error("Submission failed.");
             * ─────────────────────────────────────────────────────────────
             */

            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="waitlist" className="py-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0FFFB]/10 to-transparent" />

            {/* Background glow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-[0.08]"
                style={{ background: "radial-gradient(ellipse, #2B59E0, transparent 65%)" }}
            />

            <div className="max-w-2xl mx-auto text-center relative z-10">
                {/* Urgency badge */}
                <div className="inline-flex items-center gap-2 bg-[#001A6E]/50 border border-[#F0FFFB]/12 px-4 py-1.5 rounded-full mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse inline-block" />
                    <span className="text-[#F0FFFB]/80 text-sm font-medium">
                        <span className="text-[#7BA4FF] font-semibold">47 spots</span> remaining in this cohort
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
                    getting early access to FocusBill. Be first to know exactly what
                    your focused work is earning you.
                </p>

                {/* Form */}
                {!submitted ? (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                        <div className="flex-1">
                            <input
                                id="waitlist-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="you@yourcompany.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                }}
                                className="input-emerald w-full px-5 py-4 rounded-xl text-sm"
                                disabled={loading}
                                aria-label="Email address"
                                aria-describedby={error ? "email-error" : undefined}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary px-6 py-4 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    <span>Joining...</span>
                                </span>
                            ) : (
                                <span>Get Early Access →</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="animate-fade-up max-w-md mx-auto">
                        <div className="border border-[#2B59E0]/35 bg-[#001A6E]/30 rounded-2xl px-8 py-8 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#001A6E]/60 border border-[#2B59E0]/40 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7 text-[#7BA4FF]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#F0FFFB] mb-1">
                                    You&apos;re on the list.
                                </p>
                                <p className="text-[#7BA4FF] font-medium">
                                    Early access coming soon.
                                </p>
                            </div>
                            <p className="text-[#F0FFFB]/45 text-sm text-center leading-relaxed">
                                We&apos;ll email you the moment beta opens. In the meantime, spread the
                                word to move up the queue.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !submitted && (
                    <p
                        id="email-error"
                        role="alert"
                        className="mt-3 text-red-400 text-sm text-center animate-fade-in"
                    >
                        {error}
                    </p>
                )}

                {!submitted && (
                    <p className="mt-4 text-[#F0FFFB]/25 text-xs">
                        No spam. No credit card. Unsubscribe anytime.
                    </p>
                )}

                {/* Perks */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {[
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" />
                                </svg>
                            ),
                            title: "Free Forever Plan",
                            desc: "Beta users get a permanent free tier after launch.",
                        },
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            ),
                            title: "Priority Feature Access",
                            desc: "Shape the product — your feedback drives what we build.",
                        },
                        {
                            icon: (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7BA4FF]">
                                    <path d="M12 2l8 3v6c0 4.97-3.525 9.38-8 10.93C7.525 20.38 4 15.97 4 11V5l8-3z" /><path d="M9 12l2 2 4-4" />
                                </svg>
                            ),
                            title: "Private & Secure",
                            desc: "Your data never leaves your device. No tracking.",
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
