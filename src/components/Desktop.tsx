import styles from "@win99/css/components/Desktop.module.css";
import logo from "@assets/branding/logo.svg";
import { useEffect, useRef, useState } from "react";
import woosh1 from "@assets/desktop/audio/open-taskbar.mp3";
import woosh2 from "@assets/desktop/audio/shut-taskbar.mp3";
import openProgram from "@assets/desktop/audio/open-program.mp3";

function hasParentWithClass(el: HTMLElement, className: string): boolean {
	if (el.classList.contains(className)) return true;
	if (el.parentElement) {
		return hasParentWithClass(el.parentElement, className);
	}
	return false;
}

function AppGridItem({
	title,
	icon,
	onClick,
}: {
	title: string;
	icon: string;
	onClick?: () => void;
}) {
	return (
		<div
			onClick={(e) => {
				// clone self
				const target = e.target as HTMLDivElement;
				const bounds = target.getBoundingClientRect();
				const clone = target.cloneNode(true) as HTMLDivElement;
				const desktop = document.getElementsByClassName(
					styles.desktop
				)[0];
				clone.style.position = "fixed";
				clone.style.top = `${bounds.top}px`;
				clone.style.left = `${bounds.left}px`;
				clone.style.width = `${bounds.width}px`;
				clone.style.height = `${bounds.height}px`;
				clone.style.zIndex = "99";
				clone.style.pointerEvents = "none";
				desktop?.appendChild(clone);
				clone.animate(
					[
						{
							transform: "scale(1)",
							opacity: 1,
						},
						{
							opacity: 0.1,
						},
						{
							opacity: 0.05,
						},
						{
							transform: "scale(3)",
							opacity: 0,
						},
					],
					{
						fill: "forwards",
						duration: 750,
						easing: "cubic-bezier(0.19, 1, 0.22, 1)",
					}
				);
				setTimeout(() => {
					desktop?.removeChild(clone);
				}, 250);
				const audio = new Audio(openProgram);
				audio.play();
				onClick?.();
			}}
			className={styles.appGridItem}
		>
			<div className={styles.appGridItemBg} />
			<div className={styles.appGridItemHover} />
			<div className={styles.appGridItemActive} />
			<img src={icon} />
			<span>{title}</span>
		</div>
	);
}

function Desktop() {
	const taskbarRef = useRef<HTMLDivElement>(null);
	const [launchpadOpen, setLaunchpadOpen] = useState<boolean | null>(null);
	function onClick() {
		setLaunchpadOpen(false);
	}
	function playWoosh(type: 1 | 2) {
		const audio = new Audio(type === 1 ? woosh1 : woosh2);
		audio.play();
	}
	useEffect(() => {
		if (!taskbarRef.current) return;
		const taskbar = taskbarRef.current;
		let initialPos = { x: 0, y: 0 };
		let initialTransformY = 0;
		function mouseDown(e: MouseEvent | TouchEvent) {
			const target = e.target as HTMLDivElement;
			if (
				!target.classList.contains(styles.taskbar) &&
				!target.classList.contains(styles.belowTaskbar) &&
				!target.classList.contains(styles.taskbarContent)
			)
				return;
			const taskbar = taskbarRef.current;
			if (!taskbar) return;
			document.addEventListener("mousemove", mouseMove);
			document.addEventListener("touchmove", mouseMove);
			if ("clientX" in e) {
				initialPos = { x: e.clientX, y: e.clientY };
			} else {
				initialPos = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY,
				};
			}
			const style = window.getComputedStyle(taskbar);
			const matrix = new DOMMatrixReadOnly(style.transform);
			initialTransformY = matrix.m42 + 56;
			taskbar.style.transition = "none";
			document.addEventListener("mouseup", mouseUp);
			document.addEventListener("touchend", mouseUp);
		}
		function mouseMove(e: MouseEvent | TouchEvent) {
			let diffX, diffY;
			if ("clientX" in e) {
				diffX = e.clientX - initialPos.x;
				diffY = e.clientY - initialPos.y;
			} else {
				diffX = e.touches[0].clientX - initialPos.x;
				diffY = e.touches[0].clientY - initialPos.y;
			}
			const distance = Math.abs(diffX);
			const scalingFactor = 0.01;
			const scaledDiffX = diffX / (1 + scalingFactor * distance);
			const taskbar = taskbarRef.current;
			if (!taskbar) return;
			taskbar.style.transform = `translate(calc(-50% + ${scaledDiffX}px), calc(-54px + ${diffY}px + ${initialTransformY}px))`;
		}

		function mouseUp(e: MouseEvent | TouchEvent) {
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("touchmove", mouseMove);
			const taskbar = taskbarRef.current;
			if (!taskbar) return;
			taskbar.style.transition = "";
			// if we're not in the bottom 1/4 of the screen, open the taskbar
			// if we are, close it
			// if we're in any of the rest, if its open close it and if its closed open it
			const bottom = window.innerHeight;
			let y;
			if ("clientX" in e) {
				y = e.clientY;
			} else {
				y = e.touches[0].clientY;
			}
			const diff = bottom - y;
			const style = window.getComputedStyle(taskbar);
			const matrix = new DOMMatrixReadOnly(style.transform);
			const currentY = matrix.m42 + 56;
			if (currentY === initialTransformY) return;
			if (launchpadOpen && currentY < initialTransformY) {
				setLaunchpadOpen(true);
				taskbar.style.transform = `translate(-50%, calc(0px - (100vh - 40px - 1px)))`;
				playWoosh(1);
				return;
			}
			if (diff < bottom / 8) {
				setLaunchpadOpen(false);
				taskbar.style.transform = `translate(-50%, -54px)`;
				playWoosh(2);
			} else if (diff > (bottom / 8) * 7) {
				setLaunchpadOpen(true);
				taskbar.style.transform = `translate(-50%, calc(0px - (100vh - 40px - 1px)))`;
				playWoosh(1);
			} else {
				setLaunchpadOpen((o) => !o);
				playWoosh(launchpadOpen ? 2 : 1);
			}
		}
		taskbar.addEventListener("mousedown", mouseDown);
		taskbar.addEventListener("touchstart", mouseDown);
		return () => {
			taskbar.removeEventListener("mousedown", mouseDown);
			taskbar.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
			taskbar.removeEventListener("touchstart", mouseDown);
			taskbar.removeEventListener("touchmove", mouseMove);
			document.removeEventListener("touchend", mouseUp);
		};
	}, [launchpadOpen]);
	useEffect(() => {
		const listener = (e: MouseEvent) => {
			if (
				!hasParentWithClass(e.target as HTMLElement, styles.taskbar) &&
				!hasParentWithClass(
					e.target as HTMLElement,
					styles.startButton
				) &&
				launchpadOpen
			) {
				setLaunchpadOpen(false);
				playWoosh(2);
			}
		};
		document.addEventListener("click", listener);
		return () => document.removeEventListener("click", listener);
	}, [launchpadOpen]);
	return (
		<div className={styles.desktop}>
			<div
				className={styles.taskbar}
				ref={taskbarRef}
				style={{
					transform: launchpadOpen
						? "translate(-50%, calc(0px - (100vh - 40px - 1px)))"
						: "translate(-50%, -54px)",
				}}
			>
				<div className={styles.taskbarContent}>
					<div
						className={styles.startButton}
						onClick={() => {
							playWoosh(launchpadOpen ? 2 : 1);
							setLaunchpadOpen(!launchpadOpen);
						}}
					>
						<div className={styles.quadrantHover} />
						<img src={logo} />
					</div>
				</div>
				<div className={styles.belowTaskbar}>
					<h1>Start Board</h1>
					<div className={styles.appGrid} id="app-grid">
						{[...Array(60)].map((_, i) => (
							<AppGridItem
								onClick={onClick}
								key={i}
								title="File Explorer"
								icon={logo}
							/>
						))}
					</div>
				</div>
			</div>
			{/* <div className={styles.behindTaskbar}>
				<div
					className={styles.launchpad}
					onClick={(e) => {
						const t = e.target as HTMLDivElement;
						if (!t.classList.contains(styles.launchpad)) return;
						setLaunchpadOpen(false);
					}}
					style={{
						backdropFilter: launchpadOpen
							? "blur(12px)"
							: "blur(0px)",
						WebkitBackdropFilter: launchpadOpen
							? "blur(12px)"
							: "blur(0px)",
						backgroundColor: launchpadOpen
							? "color-mix(in srgb, var(--accent-color), transparent 80%)"
							: "transparent",
						pointerEvents: launchpadOpen ? "all" : "none",
						boxShadow: launchpadOpen
							? "0px 0px 16px rgba(0, 0, 0, 0.5), inset 0px 0px 0px 1px #ffffff80, 0px 0px 0px 1px #00000080"
							: "0px 0px 16px rgba(0, 0, 0, 0), inset 0px 0px 0px 1px #ffffff00, 0px 0px 0px 1px #00000000",
						transform: launchpadOpen
							? "translateY(0)"
							: "translateY(100%)",
					}}
				>
					<div
						style={{
							opacity: launchpadOpen ? 1 : 0,
						}}
						className={styles.launchpadContent}
					>
						<div>// todo: display programs here</div>
					</div>
				</div>
			</div> */}
		</div>
	);
}

export default Desktop;
