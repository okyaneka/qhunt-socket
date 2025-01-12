import { socket } from "~/helpers";

const ChallengeSocket = socket.listen((socket) => {});

export default ChallengeSocket;
