import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "FocusBill – Know Exactly What Your Focus Is Worth",
    description:
        "FocusBill is the Chrome extension that tracks your focused work hours and converts them into real billable income. Built for freelancers who want clarity on what they actually earn.",
    keywords: [
        "freelancer billing",
        "focus tracking",
        "billable hours",
        "productivity",
        "freelance income",
        "time tracking",
        "Chrome extension",
        "FocusBill",
    ],
    authors: [{ name: "FocusBill" }],
    creator: "FocusBill",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://focusbill.app",
        title: "FocusBill – Know Exactly What Your Focus Is Worth",
        description:
            "Stop losing track of your income. FocusBill turns every hour of deep work into visible, real earnings. Free Chrome extension for freelancers.",
        siteName: "FocusBill",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "FocusBill – Productivity meets income clarity",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "FocusBill – Know Exactly What Your Focus Is Worth",
        description:
            "Stop losing track of your income. FocusBill turns every hour of deep work into visible, real earnings. Free Chrome extension for freelancers.",
        images: ["/og-image.png"],
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    metadataBase: new URL("https://focusbill.app"),
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased">{children}</body>
        </html>
    );
}
