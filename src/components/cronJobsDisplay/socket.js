import ReconnectingWebSocket from 'reconnecting-websocket';

const SALTPETER_WS = "ws://" + new URL(window.location.href).host  + "/ws";

export const socket = new ReconnectingWebSocket(SALTPETER_WS);

