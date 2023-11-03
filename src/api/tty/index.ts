import { Kernel } from "@win99/kernel";
import { ListenerType } from "../../types";
import { v4 } from "uuid";

export class TTYService {
	private static listeners: ListenerType<string[]> = [];
	private static buffer: string[] = ["welcome to windows 09!"];
	static addEventListener(cb: (data: string[]) => void) {
		const id = v4();
		this.listeners.push({ id, cb });
		cb(this.buffer);
		return id;
	}
	static removeEventListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	private static callListeners() {
		this.listeners.forEach((l) => l.cb(this.buffer));
	}
	static printf(text: string) {
		this.buffer.push(text);
		this.callListeners();
	}
	static async waitKey(key?: string) {
		if (Kernel.getBooted() === "booted")
			throw new Error(
				`you shouldn't call whilst ${Kernel.getBooted()}, dummy !!! >:`
			);
		return new Promise<string>((res) => {
			function touchStart(e: TouchEvent) {
				e.preventDefault();
				window.removeEventListener("touchstart", touchStart);
				res("touch");
			}
			function keyDown(e: KeyboardEvent) {
				if (key) {
					if (e.key === key) {
						res(e.key);
						window.removeEventListener("keydown", keyDown);
					}
				} else {
					res(e.key);
					window.removeEventListener("keydown", keyDown);
				}
			}
			window.addEventListener("keydown", keyDown);
			window.addEventListener("touchstart", touchStart);
		});
	}
}
