import { Support } from "./lib/Support.js";
import { HueSocket, IHueSocketOptions } from "./lib/HueSocket.js";
import { ISocket } from "./lib/ISocket.js";
import { IColour } from "./lib/IColour.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import http from "http";

const debug = process.env.DEBUG ?? false;
let logFrame: (...args: any[]) => void;

if (debug) {
  (async () => {
    const { HueConsole } = await import("./lib/HueConsole.js");
    logFrame = HueConsole.logFrame;
  })();
}

let socket: ISocket;

async function init() {
  if (process.argv[2] !== "local") {
    const dotFireplace = JSON.parse(
      readFileSync(resolve(process.cwd(), "./.fireplace.json")).toString()
    );

    const hueOptions: IHueSocketOptions = dotFireplace;

    socket = new HueSocket(hueOptions);
  } else {
    const TestSocket = (await import("./lib/TestSocket.js")).TestSocket;
    socket = new TestSocket();
  }

  socket.onClientConnect(main);

  socket.connect();
}

init();

function main(mySocket: ISocket) {
  let command = "";
  const httpServer = http.createServer();

  const commandPromise = (): Promise<void> => {
    return new Promise<void>(resolve => {
      httpServer.once(
        "request",
        (request: http.IncomingMessage, response: http.ServerResponse) => {
          // XXX: This is only required for the local debug/WebSocket path
          if (request.method === "OPTIONS") {
            response.setHeader("Access-Control-Allow-Origin", "localhost");
            response.writeHead(200);
            response.end();
            resolve();
          }
          const url = new URL(
            request.url ?? "",
            `http://${request.headers.host}`
          );
          if (url.pathname.toLowerCase().startsWith("/hue-fireplace/")) {
            command = url.pathname.split("/")[2] ?? "";
          }
          response.writeHead(200, { "Content-Type": "text/plain" });
          response.end("Okay!");
          resolve();
        }
      );
    });
  };
  let resolveOnCommand = commandPromise();

  httpServer.listen(9000);

  let exitMain = false;
  const resolveOnSIGTERM = new Promise<void>(resolve => {
    process.once("SIGTERM", () => {
      console.warn("Interrupt received; attempting to start graceful exit");
      exitMain = true;
      resolve();
    });
  });

  // Turn SIGINT (Ctrl+C) into SIGTERM
  process.once("SIGINT", () => {
    process.emit("SIGTERM");
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  return (async () => {
    const baseColour: IColour = { red: 254, green: 158, blue: 82 };
    let colour: IColour = { red: 0, green: 0, blue: 0 };
    let wind = 0;
    let frameCounter = 0;
    let paused = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await Promise.race([
        // Message-rate 50 Hz (20 ms)
        Support.delay(paused ? 1000 : 20),
        resolveOnCommand,
        resolveOnSIGTERM
      ]);

      if (command.length > 0) {
        resolveOnCommand = commandPromise();
        const receivedCommand = command.toLowerCase();
        command = "";

        switch (receivedCommand) {
          case "stop":
            paused = true;
            break;
          case "start":
            paused = false;
            break;
          case "abort":
            exitMain = true;
            break;
        }
      }

      if (paused) {
        continue;
      }
      if (exitMain) {
        break;
      }

      // Full sinus-wave

      if (frameCounter % 120 === 0) {
        wind = Math.random();
      }

      // Effect-rate 12.5 Hz

      if (frameCounter % 4 === 0) {
        const sin = ((Math.PI * 2) / 120) * frameCounter;
        const amplitude = 0.5 * Math.sin(sin) + 0.5;
        const jitter = 0.65 + Math.random() * 0.35;
        const y = 0.28 + amplitude * jitter * 0.16 * (0.75 * wind + 0.25);

        colour = {
          red: Math.round(y * baseColour.red),
          green: Math.round(y * baseColour.green),
          blue: Math.round(y * baseColour.blue)
        };

        if (logFrame) {
          logFrame(frameCounter, colour);
        }
      }

      try {
        mySocket.sendColour(colour);
      } catch {
        mySocket.close();
        break;
      }

      frameCounter++;
    }
    try {
      socket.close();
      console.log("closed");
    } catch {
      console.warn("close failed");
    }

    process.exit();
  })();
}
