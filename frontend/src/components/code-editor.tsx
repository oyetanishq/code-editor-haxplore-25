import { Dispatch, SetStateAction } from "react";
import classNames from "classnames";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-dark.css";

export type tab = {
	id: number;
	active: boolean;
	name: string;
	code: string;
};

export const exampleTabs: tab[] = [
	{
		id: 1,
		active: true,
		name: "All Students",
		code: "SELECT\n    students.id AS 'Student ID',\n    CONCAT(students.firstName, ' ', students.lastName) AS 'Full Name',\n    students.email AS 'Student Email',\n    GROUP_CONCAT(courses.code) AS 'Enrolled Courses',\n    SUM(courses.credits) AS 'Total Credits'\n\nFROM\n    students JOIN enrollments\n    ON(students.id = enrollments.student_id)\n    \n    JOIN courses\n    ON(courses.id = enrollments.course_id)\n    \nGROUP BY students.id\nORDER BY [Full Name] ASC;\n",
	},
	{
		id: 2,
		active: false,
		name: "All Tables",
		code: "SELECT name FROM sqlite_master WHERE type='table';\n\n-- Describe Table\n-- pragma table_info(table_name)\n",
	},
];

export default function CodeEditor({ tabs, setTabs, className }: { tabs: tab[]; setTabs: Dispatch<SetStateAction<tab[]>>; className: string | undefined }) {
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
							onClick={() => setTabs((tab) => tab.map(({ id: ID, name, code }) => ({ id: ID, name, active: ID == id, code })))}
							onDoubleClick={() => console.log("change name request")}
							className={classNames("h-6 w-full relative flex justify-start px-4 items-center text-sm font-bold text-center", active ? "text-indigo-700" : "text-gray-600 hover:text-gray-800")}
						>
							{name}
						</button>
					);
				})}
				{/* <div className="h-full flex-1 flex justify-start items-center border-b border-rose-200">
					<label
						className="mx-4 hover:rotate-90 transition duration-300 cursor-pointer h-6 w-6 rounded-md bg-rose-300 hover:bg-rose-400 text-red-600 hover:text-red-700 flex justify-center items-center font-semibold"
						onClick={() => setTabs((tabs) => [...tabs, { id: tabs.length + 1, active: false, name: prompt("Enter Tab Name", "New Tab") ?? "New Tab", code: "" }])}
					>
						+
					</label>
				</div> */}
			</div>

			{/* editor */}
			<div className="h-full w-[calc(100%-16rem)]">
				{tabs.map(({ id, code, active }) => {
					return (
						<div key={id} className={classNames(active ? "" : "hidden", "overflow-scroll h-full w-full hide-scrollbar")}>
							<Editor
								className="editor"
								value={code}
								onValueChange={(newCode) => setTabs((tab) => tab.map(({ id: ID, name, code }) => ({ id: ID, name, active: ID == id, code: ID == id ? newCode : code })))}
								highlight={(code) =>
									highlight(code, languages.sql, "sql")
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
