import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export default function Home() {
    return (
        <main className="relative bg-[#050a0e] min-h-screen overflow-x-hidden">
            <ScrollRevealProvider />
            <Navbar />
            <Hero />
            <Problem />
            <Solution />
            <HowItWorks />
            <Testimonials />
            <CTA />
            <Footer />
        </main>
    );
}
