import { KernelModule } from "@win99/kernel";
import { TTYService } from "@win99/tty";
import { Filesystem } from "@win99/filesystem";

const FS = new KernelModule("Filesystem", "preboot", async () => {
	TTYService.printf("[fs] initializing filesystem...");
	await Filesystem.openDb();
	TTYService.printf("[fs] filesystem initialized !! :o");
});

export default FS;
