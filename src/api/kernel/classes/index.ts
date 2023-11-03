import { TTYService } from "@win99/tty";
import { Target, targets } from "@win99/kernel";
import { ListenerType } from "../../../types";
import { v4 } from "uuid";

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
		if (this.booted !== "preboot")
			throw new Error(
				`kernel is already ${this.booted.toUpperCase()}, dummy !!! >:`
			);
		TTYService.printf("");
		TTYService.printf(
			"[kernel] attempting to boot (probably will fail ^-^)"
		);
		const modules: KernelModule[] = await Promise.all(
			Object.values(import.meta.glob("@win99/kernel/modules/*.ts")).map(
				(p) =>
					p()
						.then((m: any) => m.default)
						.catch(console.error)
			)
		);
		for await (const target of targets) {
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
	}
}
