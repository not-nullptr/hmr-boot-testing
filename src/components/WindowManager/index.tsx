import { useEffect, useState } from "react";
import { Window } from "@win99/wm";
import { Process, ProcessManager } from "@win99/process";
import styles from "@win99/css/components/WindowComponent.module.css";
import { joinClasses } from "@win99/util";
import close from "@assets/desktop/audio/open-program-alt.mp3";

function useProcesses() {
	const [processes, setProcesses] = useState<Process[]>(
		ProcessManager.getProcesses()
	);
	useEffect(() => {
		ProcessManager.addListener((data) => {
			setProcesses([...data]);
		});
	}, []);
	return processes;
}

function useWindows() {
	const processes = useProcesses();
	const [windows, setWindows] = useState<Window[]>([]);
	useEffect(() => {
		let windows: Window[] = [];
		for (const process of processes) {
			windows = [...windows, ...process.windows];
		}
		setWindows([...windows]);
	}, [processes]);
	return windows;
}

function useDraggable(id: string) {
	useEffect(() => {
		const windowUndef = document.getElementById(id);
		const titlebarUndef = windowUndef?.getElementsByClassName(
			styles.titlebar
		)[0];
		if (!windowUndef || !titlebarUndef) return;
		const titlebar = titlebarUndef as HTMLDivElement;
		const windowEl = windowUndef as HTMLDivElement;
		let initialMousePos = { x: 0, y: 0 };
		let initialWindowPos = { x: 0, y: 0 };
		function mouseDown(e: MouseEvent) {
			initialMousePos = { x: e.clientX, y: e.clientY };
			const style = window.getComputedStyle(windowEl);
			// get window.style.top and window.style.left
			initialWindowPos = {
				x: parseInt(style.left.replace("px", "")),
				y: parseInt(style.top.replace("px", "")),
			};
			console.log("mouse down");
			document.addEventListener("mousemove", mouseMove);
			document.addEventListener("mouseup", mouseUp);
		}
		function mouseMove(e: MouseEvent) {
			// use style.top and style.left
			const diffX = e.clientX - initialMousePos.x;
			const diffY = e.clientY - initialMousePos.y;
			const x = initialWindowPos.x + diffX;
			const y = initialWindowPos.y + diffY;
			windowEl.style.top = `${y}px`;
			windowEl.style.left = `${x}px`;
		}
		function mouseUp() {
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
		}
		titlebar.addEventListener("mousedown", mouseDown);
		return () => {
			titlebar.removeEventListener("mousedown", mouseDown);
		};
	}, []);
}

function useZIndex(id: string) {
	useEffect(() => {
		const windowUndef = document.getElementById(id);
		if (!windowUndef) return;
		const windowEl = windowUndef as HTMLDivElement;
		function mouseDown() {
			// get the highest z index out of all windows
			// set the window's z index to that + 1
			const windows = document.getElementsByClassName(
				styles.window
			) as HTMLCollectionOf<HTMLDivElement>;
			let maxZIndex = 0;
			for (const window of windows) {
				const zIndex = parseInt(window.style.zIndex);
				if (zIndex > maxZIndex) maxZIndex = zIndex;
				window.classList.add(styles.unfocused);
			}
			windowEl.style.zIndex = `${maxZIndex + 1}`;
			windowEl.classList.remove(styles.unfocused);
		}
		windowEl.addEventListener("mousedown", mouseDown);
		mouseDown();
		return () => {
			windowEl.removeEventListener("mousedown", mouseDown);
		};
	}, []);
}

function useCenter(id: string) {
	const [center, setCenter] = useState({ x: 0, y: 0 });
	useEffect(() => {
		// (window.innerWidth / 2) - windowEl.width
		// (window.innerHeight / 2) - windowEl.height
		const windowUndef = document.getElementById(id);
		if (!windowUndef) return;
		const windowEl = windowUndef as HTMLDivElement;
		const style = window.getComputedStyle(windowEl);
		const width = parseInt(style.width.replace("px", ""));
		const height = parseInt(style.height.replace("px", ""));
		const x = window.innerWidth / 2 - width / 2;
		const y = window.innerHeight / 2 - height / 2;
		setCenter({ x, y: y - 24 });
	}, []);
	return center;
}

function WindowComponent({ win }: { win: Window }) {
	useDraggable(win.id);
	useZIndex(win.id);
	const center = useCenter(win.id);
	useEffect(() => {
		const id = win.addListener((type) => {
			if (type === "close") {
				const window = document.getElementById(win.id);
				if (!window) return;
				window.animate(
					[
						{
							transform:
								"perspective(800px) rotateX(0deg) scale(1)",
							opacity: "1",
						},
						{
							transform:
								"perspective(800px) rotateX(-10deg) scale(0.9)",
							opacity: "0",
						},
					],
					{
						fill: "forwards",
						duration: 250,
						easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
					}
				).onfinish = () => {
					// add unfocused to all windows, remove unfocused from the window with the highest z-index, excluding this one
					const windows = document.getElementsByClassName(
						styles.window
					) as HTMLCollectionOf<HTMLDivElement>;
					let maxZIndex = 0;
					let maxZIndexWindow = null;
					for (const window of windows) {
						const zIndex = parseInt(window.style.zIndex);
						if (zIndex > maxZIndex && window.id !== win.id) {
							maxZIndex = zIndex;
							maxZIndexWindow = window;
						}
						window.classList.add(styles.unfocused);
					}
					if (maxZIndexWindow) {
						maxZIndexWindow.classList.remove(styles.unfocused);
					}
				};
				const audio = new Audio(close);
				audio.play();
			}
		});
		return () => {
			win.removeListener(id);
		};
	}, []);
	return (
		<div
			className={styles.window}
			style={{
				top: center.y,
				left: center.x,
			}}
			id={win.id}
		>
			<div className={styles.titlebar}>
				<div className={styles.title}>{win.props.title}</div>
				<div className={styles.buttons}>
					<div
						className={joinClasses(
							styles.button,
							styles.closeButton
						)}
						onClick={() => win.close()}
					/>
					<div className={styles.button} />
					{/* <div className={styles.button} />
					<div className={styles.button} /> */}
				</div>
			</div>
			<div className={styles.content}>
				<win.props.Component win={win} />
			</div>
		</div>
	);
}

export function WindowProvider() {
	const windows = useWindows();
	return (
		<div className={styles.windows}>
			{windows.map((win) => (
				<WindowComponent key={win.id} win={win} />
			))}
		</div>
	);
}
