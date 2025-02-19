import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./pages/index.tsx";
import Room from "./pages/room.tsx";
import EnterRoom from "./pages/enterroom.tsx";

const root = document.getElementById("root")!;
createRoot(root).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route index element={<App />} />
				<Route path=":rid" element={<EnterRoom />} />
				<Route path=":rid/:name" element={<Room />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
