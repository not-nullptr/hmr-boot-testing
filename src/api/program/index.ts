import { Process } from "@win99/process";
import { WindowProps, Window } from "@win99/wm";
import TestWindow from "@windows/TestWindow";
import { v4 } from "uuid";

export class Program {
	constructor(
		public name: string,
		public icon: string,
		public mainWindow: Omit<WindowProps, "icon">
	) {}
	spawn() {
		const process = new Process(
			v4(),
			this.name,
			new Window({ ...this.mainWindow, icon: this.icon }, v4())
		);
		process.spawn();
		return process;
	}
}

export const programs: Program[] = [
	new Program("File Explorer", "file-explorer", {
		Component: TestWindow,
		title: "File Explorer",
	}),
];
