"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Mounts the scroll-reveal IntersectionObserver for the whole page. */
export default function ScrollRevealProvider() {
    useScrollReveal();
    return null;
}
