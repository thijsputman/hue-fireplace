import { config } from "./config";
import { dtls } from "node-dtls-client";
import * as request from "request-promise-native";
import { Support} from "./lib/Support";

let socket: dtls.Socket;

const hueHub = config.bridge;
const hueClientKey = Buffer.from(config.clientKey, "hex");
const hueUserName = config.userName;

async function setStream(state: boolean) {
    const woei = await request.put(
        "http://" + hueHub + "/api/" + hueUserName + "/groups/6",
        {
            json: true,
            body: {
                stream: {
                    active: state,
                },
            },
        }
    );

    console.log(woei);
}

(async () => {
    await setStream(true);

    process.on("SIGINT", () => {
        (async () => {
            await setStream(false);

            process.exit();
        })();
    });

    const options: dtls.Options = {
        type: "udp4",
        address: hueHub,
        port: 2100,
        psk: {},
        timeout: 1000,
    };
    options.psk[hueUserName] = hueClientKey.toString("binary");

    socket = dtls
        .createSocket(options)
        .on("connected", main)
        .on("message", x => {
            console.log("recv", x);
        })
        .on("error", x => {
            console.log("err", x);
        });
})();

function main() {
    const message = Buffer.concat([
        Buffer.from("HueStream", "ascii"),
        // prettier-ignore
        Buffer.from([
            0x01, 0x00, // version 1.0
            0x00, // sequence (ignored)
            0x00, 0x00, // reserved
            0x00, // color mode RGB
            0x00, // reserved
            0x00, 0x00, 15, // light #15
        ]),
    ]);

    (async () => {
        let colour: Buffer = Buffer.from([]);
        let frameCounter: number = 0;

        while (true) {
            // Message-rate 50 Hz

            await Support.delay(20);

            // Effect-rate 12.5 Hz

            if (frameCounter % 4 === 0) {
                const y = 0.5 * Math.sin(frameCounter / 20) + 0.5;

                // 16-bit values; appear not to work :?
                // const x = Buffer.from((new Uint16Array([y * 0xffff])).buffer);
                // colour = Buffer.concat([x,x,x]);

                // prettier-ignore
                colour = Buffer.from([
                    (y * 0xff) as number,
                    0x00,
                    (y * 0xff) as number,
                    0x00,
                    (y * 0xff) as number,
                    0x00
                ])

                console.log(Date.now(), colour);
            }

            socket.send(Buffer.concat([message, colour]));

            frameCounter++;
        }
    })();
}
