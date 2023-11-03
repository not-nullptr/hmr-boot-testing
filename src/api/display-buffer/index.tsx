import { useEffect, useState } from "react";
import { ListenerType } from "../../types";
import { v4 } from "uuid";

type Listener = ListenerType<React.FC | undefined>;

export class DisplayBuffer {
	private static listeners: Listener = [];
	static component: React.FC | undefined;
	static addEventListener(cb: Listener[0]["cb"]) {
		const id = v4();
		this.listeners.push({ id, cb });
		console.log(this.component);
		cb(this.component);
		return id;
	}
	static removeEventListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	private static callListeners() {
		this.listeners.forEach((l) => l.cb(this.component));
	}
	static setBuffer(c: React.FC) {
		this.component = c;
		this.callListeners();
	}
}

export function useDisplayBuffer() {
	const [component, setComponent] = useState<React.FC | undefined>(undefined);
	useEffect(() => {
		const id = DisplayBuffer.addEventListener((c) => {
			setComponent(() => c);
		});
		return () => {
			DisplayBuffer.removeEventListener(id);
		};
	}, []);
	return component;
}
