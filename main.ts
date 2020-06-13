import { Support } from "./lib/Support";
import { HueSocket, IHueSocketOptions } from "./lib/HueSocket";
import { ISocket } from "./lib/ISocket";
import { IColour } from "./lib/IColour";
import { readFileSync } from "fs";
import { resolve } from "path";

const debug = process.env.DEBUG ?? false;
let logFrame: (...args: any[]) => void;

if (debug) {
  (async () => {
    const { HueConsole } = await import("./lib/HueConsole");
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
    const TestSocket = (await import("./lib/TestSocket")).TestSocket;
    socket = new TestSocket();
  }

  socket.onclientConnect(main);

  socket.connect();
}

init();

process.on("SIGINT", () => {
  try {
    socket.close();
    console.log("closed");
  } catch {
    console.log("close failed");
  }

  process.exit();
});

function main(mySocket: ISocket) {
  return (async () => {
    const baseColour: IColour = { red: 254, green: 158, blue: 82 };
    let colour: IColour = { red: 0, green: 0, blue: 0 };
    let wind: number = 0;
    let frameCounter: number = 0;

    while (true) {
      // Message-rate 50 Hz

      await Support.delay(20);

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
  })();
}
