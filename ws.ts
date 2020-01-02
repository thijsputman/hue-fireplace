import { Server } from "ws";
import { Support } from "./lib/Support";

const wsServer = new Server({ port: 8099 });

process.on("SIGINT", () => {
  wsServer.close();
  console.log("closed");

  process.exit();
});

wsServer.on("connection", function connection(ws) {
  console.log("connected!");

  return (async () => {
    while (true) {
      // Message-rate 12.5 Hz

      await Support.delay(80);

      const data = [
        Math.round(Math.random() * 256),
        Math.round(Math.random() * 256),
        Math.round(Math.random() * 256)
      ];
      console.log(data);

      try {
        ws.send(Buffer.from(data));
      } catch (error) {
        if (ws.readyState >= 2) {
          console.log("closed");
        } else {
          console.log(error);
        }

        return;
      }
    }
  })();
});
