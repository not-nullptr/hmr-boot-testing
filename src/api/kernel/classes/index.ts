import { TTYService } from "@win99/tty";
import { Target, targets } from "@win99/kernel";
import { ListenerType } from "../../../types";
import { v4 } from "uuid";

/*
	THINGS OF NOTE:
	- a react hook takes care of boot detection
	- app.tsx checks if we're booted using the hook
	- are we? ok so continue, if not then Kernel.boot();
	- Kernel.boot() loads all modules and sets the booted state depending on the current state
	- if we're already booted, then it throws an error
	- if we're not, then it loads all modules

	- modules are loaded in parallel, but they're executed in order of targets
	- THE TARGETS IN QUESTION:
		- first we load "preboot"
		- then we load "boot"
		- finally, we load "gui"
	- you use preboot to initialize the DisplayBuffer with the TTY, so that the user can see wtf is going on
	- you use boot to actually do boot tasks (todo: extract rootfs and stuff)
	- you use gui to load whatever comes after (boot animation)

	- you can use TTYService.printf(text: string): void to print to the TTY
	- you can use TTYService.waitKey(key?: string): Promise<string> to wait for a keypress. parameter is
	  for a specific key. if none is specified, then it waits for any keypress OR a touch event. returns
	  the key that was pressed, or "touch" if it was a touch event
*/

type BootType = "preboot" | "booting" | "booted";

export class KernelModule {
	constructor(
		public readonly name: string,
		public readonly target: Target,
		public main: () => Promise<void> | void
	) {}
}

export class Kernel {
	private static listeners: ListenerType<BootType> = [];
	static addListener(cb: (data: BootType) => void) {
		const id = v4();
		this.listeners.push({ id, cb });
		cb(this.booted);
		return id;
	}
	static removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	private static callListeners() {
		this.listeners.forEach((l) => l.cb(this.booted));
	}
	private static booted: BootType = "preboot";
	static setBooted(booted: BootType) {
		this.booted = booted;
		this.callListeners();
	}
	static getBooted() {
		return this.booted;
	}
	static async loadModule(module: KernelModule) {
		await module.main();
	}
	static async boot() {
		try {
			if (
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				)
			) {
				TTYService.printf(
					"[kernel] you're on mobile, so i'm sorry but i'll have to crash you :/"
				);
				TTYService.printf("[kernel] goodbye :)");
				TTYService.printf("");
				TTYService.printf("");
				TTYService.printf("");
				TTYService.printf("");
				TTYService.printf("");
				throw new Error("i'm sorry :(");
			}
			if (this.booted !== "preboot")
				throw new Error(
					`kernel is already ${this.booted.toUpperCase()}, dummy !!! >:`
				);
			TTYService.printf("");
			TTYService.printf(
				"[kernel] attempting to boot (probably will fail ^-^)"
			);
			let modules: KernelModule[] = await Promise.all(
				Object.values(
					import.meta.glob("@win99/kernel/modules/*.ts")
				).map((p) =>
					p()
						.then((m: any) => m.default)
						.catch(console.error)
				)
			);
			for await (const target of targets) {
				TTYService.printf(
					`[kernel] -- beginning initialization for target ${target} --`
				);
				if (modules.some((m) => m === undefined))
					console.error(
						`OH NO some of the modules are undefined,, check your modules file your default export should be a KernelModule !! target is ${target} if it helps,, :(`
					);
				modules = modules.filter((m) => m !== undefined);
				await Promise.all(
					modules
						.filter((m) => m.target === target)
						.map((m) => Kernel.loadModule(m))
				);
			}
			TTYService.printf(
				"[kernel] god is dead and we have killed him (booted)"
			);
			this.setBooted("booted");
		} catch (e: any) {
			if (e instanceof Error) {
				TTYService.printf(`[kernel] WTF BOOT FAILED NOoOoOoOo >:`);
				e.toString()
					.split("\n")
					.forEach((line) => TTYService.printf(`[kernel] ${line}`));
			}
		}
	}
}
