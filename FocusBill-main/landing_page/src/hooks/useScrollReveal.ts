"use client";

import { useEffect, useRef } from "react";

/**
 * Adds "in-view" class to elements with the "reveal" or "stagger-children"
 * class when they enter the viewport.
 */
export function useScrollReveal() {
    useEffect(() => {
        const targets = document.querySelectorAll<HTMLElement>(
            ".reveal, .stagger-children"
        );

        if (!targets.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}
