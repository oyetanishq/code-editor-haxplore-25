import { useState } from "react";
import { useNavigate, useParams } from "react-router";

function EnterRoom() {
	const [name, setName] = useState("");
	const navigate = useNavigate();
    const { rid } = useParams();

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

					navigate(name);
				}}
			>
				continue
			</button>
		</div>
	);
}

export default EnterRoom;
