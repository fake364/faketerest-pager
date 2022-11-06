import {DefaultEventsMap} from "socket.io/dist/typed-events";
import {Socket} from "socket.io";

export const getUserIdHeaderFromSocket=(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>)=>socket.handshake.headers['x-user-id'];