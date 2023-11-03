import startupVideo from "@assets/branding/Windows09.mp4";
import { DisplayBuffer } from "@win99/display-buffer";
import WindowManager from "./Desktop";
import styles from "@win99/css/components/StartupScreen.module.css";

function StartupScreen() {
	return (
		<div className={styles.container}>
			<video
				onEnded={() => {
					DisplayBuffer.setBuffer(WindowManager);
				}}
				autoPlay
				muted
				src={startupVideo}
				playsInline
				controls={false}
				onContextMenu={(e) => e.preventDefault()}
			/>
			<video
				onEnded={() => {
					DisplayBuffer.setBuffer(WindowManager);
				}}
				autoPlay
				src={startupVideo}
				playsInline
				controls={false}
				onContextMenu={(e) => e.preventDefault()}
			/>
		</div>
	);
}

export default StartupScreen;
