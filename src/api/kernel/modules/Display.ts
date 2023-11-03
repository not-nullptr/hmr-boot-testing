import { DisplayBuffer } from "@win99/display-buffer";
import { KernelModule } from "@win99/kernel";
import { TTYService } from "@win99/tty";
import StartupScreen from "../../../components/StartupScreen";

const Display = new KernelModule("Display", "gui", async () => {
	TTYService.printf("[gui] press any key to finish gui target !! :3");
	await TTYService.waitKey();
	DisplayBuffer.setBuffer(StartupScreen);
});

export default Display;
