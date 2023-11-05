import { ProcessManager } from "@win99/process";
import { v4 } from "uuid";

type WindowEvent = "maximize" | "minimize" | "close" | "modify";

export interface WindowProps {
	title: string;
	Component: React.FC<{ win: Window }>;
	icon: string;
}

type ListenerPayload = WindowProps & {
	id: string;
};

export class Window {
	private pid: string;
	id: string;
	icon: string;
	private listeners: {
		id: string;
		cb: (type: WindowEvent, data: ListenerPayload) => void;
	}[] = [];
	addListener(cb: (type: WindowEvent, data: ListenerPayload) => void) {
		const id = v4();
		this.listeners.push({ id, cb });
		cb("modify", this.props);
		return id;
	}
	removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	private callListeners(type: WindowEvent) {
		this.listeners.forEach((l) => l.cb(type, this.props));
	}
	getProcess() {
		return ProcessManager.getProcesses().find((p) =>
			p.windows.map((w) => w.id).includes(this.id)
		);
	}
	props: ListenerPayload;
	constructor(props: WindowProps, pid: string) {
		this.props = { ...props, id: v4() };
		this.pid = pid;
		this.id = v4();
		this.icon = props.icon;
	}
	spawn() {
		ProcessManager.getProcess(this.pid)?.addWindow(this);
	}
	maximize() {
		this.callListeners("maximize");
	}
	minimize() {
		this.callListeners("minimize");
	}
	close() {
		this.callListeners("close");
		setTimeout(() => {
			const process = this.getProcess();
			if (!process) return;
			process.removeWindow(this.id);
		}, 250);
	}
}
