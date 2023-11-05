import "@win99/css/App.global.css";
import { useDisplayBuffer } from "@win99/display-buffer";
import { useBooted } from "@win99/hooks";
import { Kernel } from "@win99/kernel";
import { useEffect } from "react";

function App() {
	const Buffer = useDisplayBuffer();
	const booted = useBooted();
	useEffect(() => {
		console.log(booted);
		if (booted === "preboot") {
			Kernel.boot();
		}
	}, [booted]);
	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				color: "white",
				fontFamily: "Inter",
			}}
		>
			{Buffer ? (
				<Buffer />
			) : (
				<div
					style={{
						backgroundColor: "black",
						width: "100vw",
						height: "100vh",
					}}
				></div>
			)}
		</div>
	);
}

export default App;
