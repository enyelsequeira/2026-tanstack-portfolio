import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

if (typeof window !== "undefined") {
	ScrollTrigger.config({ ignoreMobileResize: true });

	if (document.readyState === "complete") {
		ScrollTrigger.refresh();
	} else {
		window.addEventListener("load", () => ScrollTrigger.refresh(), {
			once: true,
		});
	}
}
