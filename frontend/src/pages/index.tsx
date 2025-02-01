import { useEffect } from "react";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

function App() {
	const navigate = useNavigate();

	useEffect(() => {
		navigate(uuidv4().substring(0, 6));
	}, []);

	return <h1>loading</h1>;
}

export default App;
