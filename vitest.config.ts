import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Dedicated Vitest config so unit tests don't load the Cloudflare/TanStack
// Start Vite plugins (which target the workerd runtime and break under
// Vitest's Node-based test runner).
export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
	test: {
		environment: "jsdom",
	},
});
