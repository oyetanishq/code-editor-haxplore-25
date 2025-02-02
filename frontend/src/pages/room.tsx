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
				<Navbar code={rid.split(":")[0]} />
			</nav>

			<main className="h-[calc(100%-4rem)]">
				<CodeEditor tabs={tabs} setTabs={setTabs} className="w-full h-full flex" rid={rid.split(":")[0]} name={rid.split(":")[1]} />
			</main>
		</>
	);
}

export default App;
