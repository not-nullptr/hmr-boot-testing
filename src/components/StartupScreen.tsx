import startupVideo from "@assets/branding/Windows09.mp4";
import { DisplayBuffer } from "@win99/display-buffer";
import WindowManager from "./Desktop";

function StartupScreen() {
	return (
		<video
			onEnded={() => {
				DisplayBuffer.setBuffer(WindowManager);
			}}
			autoPlay
			src={startupVideo}
			playsInline
			style={{
				width: "100vw",
				height: "100vh",
				objectFit: "cover",
				position: "fixed",
				top: 0,
				left: 0,
				backgroundColor: "black",
			}}
			controls={false}
			onContextMenu={(e) => e.preventDefault()}
		/>
	);
}

export default StartupScreen;
