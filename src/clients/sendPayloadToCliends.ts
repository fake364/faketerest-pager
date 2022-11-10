import { SocketMapByUserId } from "../server";
import { CLIENT_EVENTS } from "faketerest-utilities/dist/events/types";

const sendPayloadToClients = (
  event: CLIENT_EVENTS,
  clientId: number,
  ...payload
) => {
  if (SocketMapByUserId[clientId]?.length > 0) {
    SocketMapByUserId[clientId].forEach((socket) => {
      socket.emit(CLIENT_EVENTS.COMMON_NOTIFICATION, ...payload);
      console.log("PUSHED NOTIFICATION TO", clientId);
    });
  } else {
    console.warn("No such client");
  }
};

export default sendPayloadToClients;
