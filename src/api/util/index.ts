import { Filesystem } from "@win99/filesystem";
import * as fileType from "file-type";

export function joinClasses(...classes: string[]): string {
	return classes.filter((c) => c).join(" ");
}

export async function blobToBase64(blob: Blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = async () => {
			const result = reader.result as string;
			const split = result.slice(0, 50).split(",");
			split[0] = `data:${await fileType.fileTypeFromBuffer(
				await blob.arrayBuffer()
			)};base64`;
			resolve(split.join(","));
		};
		reader.readAsDataURL(blob);
	});
}

export async function downloadToPath(
	url: string,
	path: string,
	cb?: (progress: number) => void
) {
	const res = await fetch(url);
	const blob = await res.blob();
	const totalSize = parseInt(res.headers.get("Content-Length") || "0", 10);
	let loadedSize = 0;

	const reader = blob.stream().getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		loadedSize += value.byteLength;
		const progress = (loadedSize / totalSize) * 100;
		if (cb) {
			cb(progress);
		}
	}

	await Filesystem.write(path, await blobToBase64(blob));
}
