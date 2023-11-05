import { Window } from "@win99/wm";
import { ListenerType } from "../../types";
import { v4 } from "uuid";

export class ProcessManager {
	private static processes: Process[] = [];
	private static listeners: ListenerType<Process[]> = [];
	static addListener(cb: (data: Process[]) => void) {
		const id = v4();
		this.listeners.push({ id, cb });
		cb(this.processes);
		return id;
	}
	static removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	private static callListeners() {
		this.listeners.forEach((l) => l.cb(this.processes));
	}
	static addProcess(process: Process) {
		this.processes.push(process);
		process.addListener(() => this.callListeners());
		this.callListeners();
	}
	static removeProcess(process: Process) {
		this.processes = this.processes.filter((p) => p !== process);
		process.removeAllListeners();
		this.callListeners();
	}
	static getProcesses() {
		return this.processes;
	}
	static getProcess(pid: string) {
		return this.processes.find((p) => p.pid === pid);
	}
}

export class Process {
	private listeners: ListenerType<Process> = [];
	private callListeners() {
		this.listeners.forEach((l) => l.cb(this));
	}
	addListener(cb: (data: Process) => void) {
		const id = v4();
		this.listeners.push({ id, cb });
		cb(this);
		return id;
	}
	removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	removeAllListeners() {
		this.listeners = [];
	}
	windows: Window[] = [this.mainWindow];
	constructor(
		public pid: string,
		public name: string,
		public mainWindow: Window
	) {}
	addWindow(win: Window) {
		this.windows.push(win);
		this.callListeners();
	}
	removeWindow(id: string) {
		this.windows = this.windows.filter((w) => w.id !== id);
		this.callListeners();
	}
	spawn() {
		ProcessManager.addProcess(this);
		this.callListeners();
	}
	kill() {
		ProcessManager.removeProcess(this);
		this.callListeners();
	}
}
