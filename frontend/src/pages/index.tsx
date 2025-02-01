import Navbar from "@components/Navbar";
import CodeEditor, { exampleTabs, tab } from "@components/code-editor";
import { useState, useEffect } from "react";

function App() {
	const [tabs, setTabs] = useState<tab[]>(exampleTabs);

	return (
		<>
			<nav>
				<Navbar />
			</nav>

			<main>
				<CodeEditor tabs={tabs} setTabs={setTabs} className="w-full h-[calc(100%-8rem)] flex" />
			</main>
		</>
	);
}

export default App;
