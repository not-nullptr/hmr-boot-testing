import { DisplayBuffer } from "@win99/display-buffer";
import { KernelModule } from "@win99/kernel";
import TTY from "../../../components/Boot";
import { TTYService } from "@win99/tty";

const TTYModule = new KernelModule("TTYModule", "preboot", async () => {
	DisplayBuffer.setBuffer(TTY);
	TTYService.printf("[ttymodule] tty has been set as the main component!");
});

export default TTYModule;
