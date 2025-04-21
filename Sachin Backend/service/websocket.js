const WebSocket = require("ws");
const log = require("../logger/loggerService.js");
function setupWebSocket(server) {
  try {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        ws.send(message); // Echo back the message
      });
      ws.on("close", () => {});
    });
  } catch (err) {
    log.logger.error("WebSocket setup error:", err);
  }
}

module.exports = { setupWebSocket };
