import Navbar from "@components/Navbar";
import CodeEditor, { exampleTabs, tab } from "@components/code-editor";
import { useState } from "react";
import { useParams } from "react-router";

function App() {
	const { rid } = useParams();
	const [tabs, setTabs] = useState<tab[]>(exampleTabs);

	if (!rid) return <h1>loading</h1>;

	return (
		<>
			<nav>
				<Navbar code={rid} />
			</nav>

			<main>
				<CodeEditor tabs={tabs} setTabs={setTabs} className="w-full h-[calc(100%-8rem)] flex" rid={rid} />
			</main>
		</>
	);
}

export default App;
