import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/sections/about-section";
import { ContactFooter } from "@/components/sections/contact-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { NavBar } from "@/components/sections/nav-bar";
import { ProjectsSection } from "@/components/sections/projects-section";
import { StatsSection } from "@/components/sections/stats-section";

export const Route = createFileRoute("/")({ component: PortfolioPage });

function PortfolioPage() {
	return (
		<>
			<NavBar />
			<main>
				<HeroSection />
				<StatsSection />
				<ProjectsSection />
				<AboutSection />
				<ContactFooter />
			</main>
		</>
	);
}
