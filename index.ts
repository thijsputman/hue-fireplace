import { config} from "./config"
import { dtls } from "node-dtls-client";
import * as request from "request-promise-native";

let socket: dtls.Socket;

const hueHub = config.bridge;
const hueClientKey = new Buffer(config.clientKey, "hex");
const hueUserName = config.userName;

(async () => {
    const woei = await request.put(
        "http://" + hueHub + "/api/" + hueUserName + "/groups/6",
        {
            json: true,
            body: {
                stream: {
                    active: true,
                },
            },
        }
    );

    console.log(woei);

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

    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    (async () => {
        while (true) {
            await delay(100);

            // prettier-ignore
            const colour = Buffer.from([
                (Math.random() * 0xff) as number,
                (Math.random() * 0xff) as number,
                (Math.random() * 0xff) as number,
                (Math.random() * 0xff) as number,
                (Math.random() * 0xff) as number,
                (Math.random() * 0xff) as number,])

            socket.send(Buffer.concat([message, colour]));
        }
    })();
}
