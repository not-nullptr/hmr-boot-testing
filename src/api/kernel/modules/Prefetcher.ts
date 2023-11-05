import { KernelModule } from "@win99/kernel";
import { TTYService } from "@win99/tty";

const Prefetcher = new KernelModule("Prefetcher", "boot", async () => {
	TTYService.printf("[prefetcher] fetching assets...");
	const vals: string[] = (
		(await Promise.all([
			// we can discard the values since we're only prefetching them and praying the browser caches them
			...Object.values(import.meta.glob("/src/assets/**/*.jpg")).map(
				(p) => p()
			),
			...Object.values(import.meta.glob("/src/assets/**/*.png")).map(
				(p) => p()
			),
			...Object.values(import.meta.glob("/src/assets/**/*.gif")).map(
				(p) => p()
			),
			...Object.values(import.meta.glob("/src/assets/**/*.svg")).map(
				(p) => p()
			),
			...Object.values(import.meta.glob("/src/assets/**/*.mp4")).map(
				(p) => p()
			),
			...Object.values(import.meta.glob("/src/assets/**/*.mp3")).map(
				(p) => p()
			),
		])) as any[]
	).map((v) => v.default);
	TTYService.printf("[prefetcher] finished!");
	const root = document.getElementById("root") as HTMLDivElement;
	const el = document.createElement("cache");

	for await (const val of vals) {
		const img = new Image();
		img.src = val;
		img.style.opacity = "0";
		img.style.position = "absolute";
		img.style.top = "0";
		img.style.left = "0";
		img.style.pointerEvents = "none";
		img.style.width = "0";
		img.style.height = "0";
		el.appendChild(img);
	}
	root.appendChild(el);
});

export default Prefetcher;
