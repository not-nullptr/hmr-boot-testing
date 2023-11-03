import { TTYService } from "@win99/tty";
import { useEffect, useState } from "react";
import styles from "@win99/css/components/Boot.module.css";
import logo from "@assets/branding/logo.svg";

function TTY() {
	const [buf, setBuf] = useState<string[]>([]);
	useEffect(() => {
		const id = TTYService.addEventListener((d) => {
			setBuf([...d]);
		});
		return () => TTYService.removeEventListener(id);
	}, []);
	return (
		<div>
			<div className={styles.tty}>
				{buf.map((b, i) => (
					<div key={i}>{b}</div>
				))}
			</div>
			<img src={logo} alt="logo" className={styles.logo} />
			<div className="crt-effect" />
		</div>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export default TTY;
