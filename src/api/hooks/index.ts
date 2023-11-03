import { Kernel } from "@win99/kernel";
import { useEffect, useState } from "react";

export function useBooted() {
	const [booted, setBooted] = useState(Kernel.getBooted());
	useEffect(() => {
		const id = Kernel.addListener((d) => {
			setBooted(d);
		});
		return () => Kernel.removeListener(id);
	}, []);
	return booted;
}
