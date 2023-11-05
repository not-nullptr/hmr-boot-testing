import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{ find: "@win99", replacement: path.resolve(__dirname, "src/api") },
			{
				find: "@assets",
				replacement: path.resolve(__dirname, "src/assets"),
			},
		],
	},
	base: process.env.VITE_BASE_URL || "/",
});
