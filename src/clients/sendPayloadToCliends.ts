import { CLIENT_EVENTS } from "./enums";
import { SocketMapByUserId } from "../server";

const sendPayloadToClients = (
  event: CLIENT_EVENTS,
  clientId: number,
  ...payload
) => {
  if (SocketMapByUserId[clientId]?.length > 0) {
    SocketMapByUserId[clientId].forEach((socket) => {
      socket.emit("subscription", ...payload);
      console.log("PUSHED NOTIFICATION TO", clientId);
    });
  } else {
    console.warn("No such client");
  }
};

export default sendPayloadToClients;
