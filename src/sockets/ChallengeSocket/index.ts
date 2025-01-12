import { UserTriviaModel } from "qhunt-lib/models";
import { ConnectionHandler } from "~/helpers";

const ChallengeSocket: ConnectionHandler = (socket) => {
  const headers = socket.handshake.headers;
  const { cookie } = headers;

  const onGetItem = (data: any) => socket.emit("onGetItem", data);
  const onSetStart = (data: any) => socket.emit("onSetStart", data);
  const onSetAnswer = (data: any) => socket.emit("onSetAnswer", data);
  const onSetSubmit = (data: any) => socket.emit("onSetSubmit", data);

  socket.on("getItem", () => {
    onGetItem({ cookie, dataLain: "others" });
  });
  socket.on("setStart", () => {});
  socket.on("setAnswer", () => {});
  socket.on("setSubmit", () => {});
};

export default ChallengeSocket;
