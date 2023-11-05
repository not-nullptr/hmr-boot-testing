type File = {
	type: "file";
	name: string;
	content: string;
};

type Directory = {
	type: "directory";
	name: string;
	children: FileSystemEntry[];
};

type FileSystemEntry = File | Directory;

async function idbAsync<T>(req: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export class Filesystem {
	private static db: IDBDatabase;
	private static throwIfClosedDb() {
		if (!this.db)
			throw new Error(
				"attempted a filesystem operation before opening the database"
			);
	}
	static async getFsRoot(): Promise<FileSystemEntry[]> {
		this.throwIfClosedDb();
		const transaction = this.db.transaction("filesystem", "readwrite");
		const store = transaction.objectStore("filesystem");
		const request = store.get("root");
		let root = await idbAsync(request);
		if (!root) {
			root = [];
			const request = store.put(root, "root");
			await idbAsync(request);
		}
		return root;
	}
	static async read(path: string): Promise<File | undefined> {
		this.throwIfClosedDb();
		const split = path.split("/").filter((p) => p);
		const root = await this.getFsRoot();
		let current: FileSystemEntry[] = root;
		for (const name of split) {
			if (!name) continue;
			const entry = current.find((entry) => entry.name === name);
			if (!entry) {
				console.error(`what a shame, nothing was found at ${path} :/`);
				return;
			}
			if (entry.type === "file") return entry;
			current = entry.children;
		}
		console.error(`what a shame, nothing was found at ${path} :/`);
		return;
	}
	static async write(path: string, content: any): Promise<void> {
		this.throwIfClosedDb();
		const split = path.split("/").filter((p) => p);
		const root = await this.getFsRoot();
		let current: FileSystemEntry[] = root;
		let parent: Directory | null = null;
		for (const name of split) {
			let entry = current.find((entry) => entry.name === name);
			if (!entry) {
				if (name === split[split.length - 1]) {
					entry = { type: "file", name, content };
					current.push(entry);
				} else {
					entry = { type: "directory", name, children: [] };
					current.push(entry);
				}
			} else if (entry.type === "file") {
				entry.content = content;
			}

			if (entry.type === "directory") {
				parent = entry;
				current = entry.children;
			}
		}
		const transaction = this.db.transaction("filesystem", "readwrite");
		const store = transaction.objectStore("filesystem");
		const request = store.put(root, "root");
		await idbAsync(request);
	}
	static async mkdir(path: string): Promise<void> {
		this.throwIfClosedDb();
		const split = path.split("/");
		const root = await this.getFsRoot();
		let current: FileSystemEntry[] = root;
		let parent: Directory | null = null;
		for (const name of split) {
			let entry = current.find((entry) => entry.name === name);
			if (!entry) {
				entry = { type: "directory", name, children: [] };
				current.push(entry);
			}
			if (entry.type === "directory") {
				parent = entry;
				current = entry.children;
			}
		}
		const transaction = this.db.transaction("filesystem", "readwrite");
		const store = transaction.objectStore("filesystem");
		const request = store.put(root, "root");
		await idbAsync(request);
	}
	static async openDb() {
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("filesystem", 1);
			request.onerror = reject;
			request.onsuccess = () => resolve(request.result);
			request.onupgradeneeded = () => {
				const db = request.result;
				db.createObjectStore("filesystem");
			};
		});
		this.db = db;
	}
}
