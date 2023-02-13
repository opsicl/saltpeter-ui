import ReconnectingWebSocket from 'reconnecting-websocket';

var SALTPETER_WS = ""

if (window.location.href.indexOf("https://") > -1) {
    SALTPETER_WS = "wss://" + new URL(window.location.href).host  + "/ws";
} else {
    SALTPETER_WS = "ws://" + new URL(window.location.href).host  + "/ws";
}

SALTPETER_WS = "ws://salt.opsi.cl:8889/ws"

export const socket = new ReconnectingWebSocket(SALTPETER_WS);

