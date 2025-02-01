import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism-dark.css";

import "prismjs/components/prism-typescript";
import { v4 } from "uuid";

export type tab = {
	id: number | string;
	active: boolean;
	name: string;
	code: string;
	language: string;
};

export const exampleTabs: tab[] = [
	{
		id: 1,
		active: true,
		name: "index.ts",
		language: "typescript",
		code: 'console.log("hi there");',
	},
];

export default function CodeEditor({ tabs, setTabs, className, rid }: { tabs: tab[]; setTabs: Dispatch<SetStateAction<tab[]>>; className: string | undefined; rid: string }) {
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket("wss://simple-ws.deno.dev");
		ws.onopen = () => console.log("connected");
		ws.onclose = () => console.log("closed");
		ws.onmessage = ({ data }) => {
			const message = JSON.parse(data).message;
			if (message.rid !== rid) return;

			if (message.type === "code-update") setTabs((tabs) => tabs.map(({ id, name, code, language, active }) => ({ id, name, active, code: name === message.name ? message.code : code, language })));
			if (message.type === "create-file") setTabs((tabs) => [...tabs, { active: false, name: message.name, language: "typescript", code: "", id: v4().substring(0, 5) }]);
		};

		setSocket(ws);

		return () => ws.close();
	}, []);

	if (!socket) return <h1>connecting</h1>;

	return (
		<div className={className}>
			{/* explorer */}
			<div className="min-w-64 flex flex-col mt-4">
				{tabs.map(({ id, name, active }) => {
					return (
						<button
							id={"file-name-" + id}
							type="button"
							key={id}
							onClick={() => setTabs((tab) => tab.map(({ id: ID, name, code, language }) => ({ id: ID, name, active: ID == id, code, language })))}
							onDoubleClick={() => console.log("change name request")}
							className={classNames("h-6 w-full relative flex justify-start px-4 items-center text-sm font-bold text-center", active ? "text-indigo-700" : "text-gray-600 hover:text-gray-800")}
						>
							{name}
						</button>
					);
				})}
				<label
					className="mx-4 hover:rotate-90 transition duration-300 cursor-pointer h-6 w-6 rounded-md bg-rose-300 hover:bg-rose-400 text-red-600 hover:text-red-700 flex justify-center items-center font-semibold"
					onClick={() => {
						const name = prompt("Enter a file name: ") || "newfile";
						socket.send(
							JSON.stringify({
								type: "sendtoall",
								message: {
									type: "create-file",
									rid,
									name,
								},
							})
						);
					}}
				>
					+
				</label>
			</div>

			{/* editor */}
			<div className="h-full w-[calc(100%-16rem)]">
				{tabs.map(({ id, code, active, language, name }) => {
					return (
						<div key={id} className={classNames(active ? "" : "hidden", "overflow-scroll h-full w-full hide-scrollbar")}>
							<Editor
								className="editor"
								value={code}
								onValueChange={(newCode) => {
									socket.send(
										JSON.stringify({
											type: "sendtoall",
											message: {
												type: "code-update",
												rid,
												name,
												code: newCode,
											},
										})
									);
								}}
								highlight={(code) =>
									highlight(code, languages[language], language)
										.split("\n")
										.map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
										.join("\n")
								}
								padding={16}
								tabSize={4}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
