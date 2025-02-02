import { serve } from "https://deno.land/std@0.145.0/http/server.ts";

/**
 *  Users can connect from all around the world to any server,
 *  All the broadcasted data will be send to each user (including those who are not in the same region)
 */
const localUsers: Map<string, WebSocket> = new Map();
const remoteUsers: string[] = [];

const remoteUserChannel = new BroadcastChannel("remote-user");
const remoteUserEmitChannel = new BroadcastChannel("remote-user-emit");

const region = Deno.env.get("DENO_REGION") || Deno.env.get("VERCEL_REGION") || Deno.env.get("AWS_REGION") || "unknown";

remoteUserChannel.onmessage = ({ data }) => {
	if (data.type === "add" && data.uid) remoteUsers.push(data.uid);
	else if (data.type === "remove" && data.uid) {
		const index = remoteUsers.indexOf(data.uid);
		if (index > -1) remoteUsers.splice(index, 1);
	}
};

remoteUserEmitChannel.onmessage = ({ data }) => {
	if (data.sendTo && data.message) {
		const user = localUsers.get(data.sendTo);
		if (user) user.send(data.message);
	}
};

const jsonToString = (data: any) => JSON.stringify(data);

serve((req: Request) => {
	const upgrade = req.headers.get("upgrade") || "";
	const uid = crypto.randomUUID();

	if (upgrade.toLowerCase() != "websocket") return new Response("request isn't trying to upgrade to websocket.");

	const { socket, response } = Deno.upgradeWebSocket(req, { idleTimeout: 5 * 60 }); // 5 Minutes

	socket.onclose = () => {
		localUsers.delete(uid);
		remoteUserChannel.postMessage({ type: "remove", uid });
	};

	socket.onopen = () => {
		localUsers.set(uid, socket);
		remoteUserChannel.postMessage({ type: "add", uid });
	};

	socket.onmessage = (ev) => {
		try {
			const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
			if (!data?.type) throw new Error("empty 'type' field is not acceptable.");

			const { sendto, message } = data;

			switch (data.type) {
				case "whoami":
					socket.send(jsonToString({ uid }));
					break;

				case "region":
					socket.send(JSON.stringify({ region }));
					break;

				case "sendto":
					if (!sendto) throw new Error("empty 'sendto' field is not acceptable.");
					if (!message) throw new Error("empty 'message' field is not acceptable.");

					if (localUsers.has(sendto)) localUsers.get(sendto).send(JSON.stringify({ type: "sendto", message }));
					else if (remoteUsers.includes(sendto)) remoteUserEmitChannel.postMessage({ sendto, message: JSON.stringify({ type: "sendto", message }) });
					else throw new Error(`User with uid: '${sendto}', not found.`);

					break;

				case "sendtoall":
					if (!message) throw new Error("empty 'message' field is not acceptable.");

					for (let [uid, uidSocket] of localUsers) uidSocket.send(JSON.stringify({ type: "sendto", message }));

					for (let uid of remoteUsers) remoteUserEmitChannel.postMessage({ sendto, message: JSON.stringify({ type: "sendto", message }) });

					break;

				case "users":
					socket.send(jsonToString({ users: [...localUsers.keys(), ...remoteUsers].join() }));
					break;

				case "ping":
					socket.send(JSON.stringify({ type: "pong" }));
					break;
			}
		} catch (err) {
			socket.send(JSON.stringify({ type: "error", message: err.message as string }));
		}
	};

	return response;
});
