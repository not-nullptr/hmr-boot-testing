import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
