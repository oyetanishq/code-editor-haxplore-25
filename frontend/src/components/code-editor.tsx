import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";

import { PiFiles } from "react-icons/pi";
import { BsChatLeftText } from "react-icons/bs";

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

export type Chat = {
	from: string;
	message: string;
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

export default function CodeEditor({ tabs, setTabs, className, rid, name: userName }: { tabs: tab[]; setTabs: Dispatch<SetStateAction<tab[]>>; className: string | undefined; rid: string; name: string }) {
	const [chats, setChats] = useState<Chat[]>([]);
	const [message, setMessage] = useState("");
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [explorer, setExplorer] = useState<"chat" | "files" | null>("files");
	const [fontSize, setFontSize] = useState("14");

	useEffect(() => {
		const ws = new WebSocket("wss://simple-ws.deno.dev");
		ws.onopen = () => console.log("connected");
		ws.onclose = () => console.log("closed");
		ws.onmessage = ({ data }) => {
			const message = JSON.parse(data).message;
			if (message.rid !== rid) return;

			if (message.type === "code-update") setTabs((tabs) => tabs.map(({ id, name, code, language, active }) => ({ id, name, active, code: name === message.name ? message.code : code, language })));
			if (message.type === "create-file") setTabs((tabs) => [...tabs, { active: false, name: message.name, language: "typescript", code: "", id: v4().substring(0, 5) }]);
			if (message.type === "message") setChats((chats) => [...chats, { from: message.name, message: message.message }]);
		};

		setSocket(ws);

		return () => ws.close();
	}, []);

	if (!socket) return <h1>connecting</h1>;

	return (
		<div className={className}>
			{/* sidebar */}
			<div className="w-20 flex flex-col items-center pt-4 gap-4 px-3 border-r">
				<PiFiles size={26} onClick={() => setExplorer((exp) => (exp === "files" ? null : "files"))} className={classNames("cursor-pointer", explorer === "files" && "fill-blue-500")} />
				<BsChatLeftText size={20} onClick={() => setExplorer((exp) => (exp === "chat" ? null : "chat"))} className={classNames("cursor-pointer", explorer === "chat" && "fill-blue-500")} />
				<label className="text-sm">
					font size
					<select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="pt-2 bg-transparent border">
						{[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30].map((size, index) => (
							<option key={size + ":" + index} value={size}>
								{size}
							</option>
						))}
					</select>
				</label>
			</div>

			{/* explorer files */}
			<div className={classNames("flex flex-col pt-4 border-r", explorer === "files" ? "w-64 " : "hidden")}>
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

			{/* explorer chatting */}
			<div className={classNames("flex flex-col justify-between pt-4 border-r", explorer === "chat" ? "w-64 " : "hidden")}>
				<div>
					{chats.map(({ from, message }, index) => {
						return (
							<div key={from + message + index} className="px-3 w-full flex justify-start pb-4">
								<p className="text-blue-700 underline underline-offset-4">{from}:</p>
								<p className="pl-2">{message}</p>
							</div>
						);
					})}
				</div>
				<div className="h-12 my-4 flex">
					<input type="text" placeholder="message" className="h-full border ml-1 px-2 w-48" onChange={(e) => setMessage(e.target.value)} value={message} />
					<button
						className="mx-1 w-16"
						onClick={() => {
							if (message.length < 1) return;

							socket.send(
								JSON.stringify({
									type: "sendtoall",
									message: {
										type: "message",
										rid,
										message,
										name: userName,
									},
								})
							);
							setMessage("");
						}}
					>
						send
					</button>
				</div>
			</div>

			{/* editor */}
			<div className={classNames("h-full", explorer ? "w-[calc(100%-21rem)]" : "w-[calc(100%-5rem)]")}>
				{tabs.map(({ id, code, active, language, name }) => {
					return (
						<div key={id} className={classNames(active ? "" : "hidden", "overflow-scroll h-full w-full hide-scrollbar")}>
							<Editor
								className="editor"
								style={{ fontSize: fontSize + "px" }}
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
