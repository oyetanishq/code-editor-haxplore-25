import { useState } from "react";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

function App() {
	const [name, setName] = useState("");
	const navigate = useNavigate();

	return (
		<div className="h-full w-full flex justify-center items-center">
			<input placeholder="Enter you name" className="p-3 bg-transparent border rounded-sm" type="text" onChange={(e) => setName(e.target.value)} value={name} />
			<button
				className="ml-3"
				onClick={() => {
					if (name.length < 4) {
						alert("Name should be min 4 letter");
						return;
					}

					navigate(uuidv4().substring(0, 6) + ":" + name);
				}}
			>
				continue
			</button>
		</div>
	);
}

export default App;
