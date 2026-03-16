"use client";

import Image from "next/image";

const links = [
    { label: "Features", href: "#solution" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Get FocusBill", href: "#install" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative border-t border-[#F0FFFB]/6 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-blue-900/25 overflow-hidden">
                            <Image
                                src="/my_logo.png"
                                alt="FocusBill Logo"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-base text-[#F0FFFB] tracking-tight">
                            Focus<span className="text-gradient">Bill</span>
                        </span>
                    </div>

                    {/* Nav links */}
                    <nav className="flex items-center gap-1">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-[#F0FFFB]/35 hover:text-[#7BA4FF] text-sm px-3 py-1.5 rounded-lg transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright */}
                    <p className="text-[#F0FFFB]/25 text-sm">
                        © {year} FocusBill. Built for freelancers.
                    </p>
                </div>

                {/* Fine print */}
                <div className="mt-8 pt-6 border-t border-[#F0FFFB]/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[#F0FFFB]/18 text-xs">
                        FocusBill is free for all freelancers. Built with care.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-[#F0FFFB]/20 hover:text-[#F0FFFB]/40 text-xs transition-colors">
                            Privacy Policy
                        </a>
                        <span className="text-[#F0FFFB]/15">·</span>
                        <a href="#" className="text-[#F0FFFB]/20 hover:text-[#F0FFFB]/40 text-xs transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
