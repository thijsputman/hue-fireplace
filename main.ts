// import { config } from "./config";
import { Support } from "./lib/Support";
// import { HueSocket, IHueSocketOptions } from "./lib/HueSocket";
import { ISocket } from "./lib/ISocket";
import { IColour } from "./lib/IColour";
import { TestSocket } from "./lib/TestSocket";

// const hueOptions: IHueSocketOptions = {
//     host: config.bridge,
//     clientKey: config.clientKey,
//     userName: config.userName,
//     light: 15,
//     lightGroup: 6
// }

// const socket = new HueSocket(hueOptions);
const socket = new TestSocket();

socket.onclientConnect(main);

socket.connect();

process.on("SIGINT", () => {
    (async () => {
        await socket.close();

        process.exit();
    })();
});

function main(mySocket: ISocket) {
    (async () => {
        let colour: IColour;
        let frameCounter: number = 0;

        while (true) {
            // Message-rate 50 Hz

            await Support.delay(20);

            // Effect-rate 12.5 Hz

            if (frameCounter % 4 === 0) {
                const y = 0.5 * Math.sin(frameCounter / 40) + 0.5;

                colour = {
                    red: Math.round(y * 255),
                    green: Math.round(y * 255),
                    blue: Math.round(y * 255),
                };
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
