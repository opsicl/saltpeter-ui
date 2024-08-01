import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorkerRegistration.register({
  onUpdate: registration => {
    if (window.confirm("New version available! Would you like to update?")) {
      const waitingServiceWorker = registration.waiting;
      if (waitingServiceWorker) {
        waitingServiceWorker.addEventListener("statechange", event => {
          if (event.target.state === "activated") {
            window.location.reload();
          }
        });
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
      }
    }
  }
});
