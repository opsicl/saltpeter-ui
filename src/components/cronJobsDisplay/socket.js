import ReconnectingWebSocket from 'reconnecting-websocket';

let apis = require("../../apis.json");
const SALTPETER_WS = apis.saltpeter_ws;
export const socket = new ReconnectingWebSocket(SALTPETER_WS);

