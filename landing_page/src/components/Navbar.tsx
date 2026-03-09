"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
    { label: "Problem", href: "#problem" },
    { label: "Features", href: "#solution" },
    { label: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#00091F]/92 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/30"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
                {/* Logo */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/30 overflow-hidden">
                        <Image
                            src="/my_logo.png"
                            alt="FocusBill Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-[#F0FFFB]">
                        Focus<span className="text-gradient">Bill</span>
                    </span>
                </div>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-[#F0FFFB]/55 hover:text-[#F0FFFB] text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA + mobile toggle */}
                <div className="flex items-center gap-3">
                    <a
                        href="#waitlist"
                        className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold hidden sm:flex items-center gap-2"
                    >
                        <span>Join Beta</span>
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                            <path
                                fillRule="evenodd"
                                d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"
                            />
                        </svg>
                    </a>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden w-9 h-9 flex items-center justify-center text-[#F0FFFB]/70 hover:text-[#F0FFFB] rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-[#00091F]/96 backdrop-blur-xl border-t border-white/8 px-6 py-4 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-[#F0FFFB]/70 hover:text-[#F0FFFB] text-sm font-medium px-4 py-3 rounded-lg transition-colors hover:bg-white/5"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#waitlist"
                        onClick={() => setMenuOpen(false)}
                        className="btn-primary mt-2 px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        Join Private Beta
                    </a>
                </div>
            )}
        </nav>
    );
}
