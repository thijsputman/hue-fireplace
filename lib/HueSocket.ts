import { ISocket } from "./ISocket";
import { dtls } from "node-dtls-client";
import * as request from "request-promise-native";
import { IColour } from "./IColour";

export interface IHueSocketOptions {
  host: string;
  userName: string;
  clientKey: string;
  light: number;
  lightGroup: number;
}

export class HueSocket implements ISocket {
  private options: IHueSocketOptions;
  private dtlsOptions: dtls.Options;
  private socket: dtls.Socket;
  private mainLoop: (socket: ISocket) => void;

  public constructor(options: IHueSocketOptions) {
    this.options = options;

    this.dtlsOptions = {
      type: "udp4",
      address: this.options.host,
      port: 2100,
      psk: {},
      timeout: 1000
    };

    const clientKey: Buffer = Buffer.from(this.options.clientKey, "hex");
    this.dtlsOptions.psk[this.options.userName] = clientKey.toString("binary");
  }

  public connect() {
    return (async () => {
      await this._setStream(true);

      this.socket = dtls
        .createSocket(this.dtlsOptions)
        .on("connected", () => {
          this.mainLoop(this);
        })
        .on("message", x => {
          console.log("recv", x);
        })
        .on("error", x => {
          console.log("err", x);
        });
    })();
  }

  public async close() {
    this._setStream(false);
  }

  private async _setStream(state: boolean) {
    // tslint:disable:no-invalid-await
    // sonarts does not seem to understand request-promise-native
    const woei = await request.put(
      "http://" +
        this.options.host +
        "/api/" +
        this.options.userName +
        "/groups/" +
        this.options.lightGroup,
      {
        json: true,
        body: {
          stream: {
            active: state
          }
        }
      }
    );
    // tslint:enable:no-invalid-await

    console.log(woei);
  }

  public sendColour(colour: IColour) {
    // TODO: Don't redefine at every call
    const message = Buffer.concat([
      Buffer.from("HueStream", "ascii"),
      // prettier-ignore
      Buffer.from([
        0x01, 0x00, // version 1.0
        0x00,       // sequence (ignored)
        0x00, 0x00, // reserved
        0x00,       // colour mode RGB
        0x00,       // reserved
        0x00, 0x00, this.options.light // Light Id(s)
      ])
    ]);

    // prettier-ignore
    const colourBuffer: Buffer = Buffer.from([
      colour.red,   0x00,
      colour.green, 0x00,
      colour.blue,  0x00
    ]);

    console.log(Date.now(), colourBuffer);

    this.socket.send(Buffer.concat([message, colourBuffer]));
  }

  public onclientConnect(mainLoop: (socket: ISocket) => void) {
    this.mainLoop = mainLoop;
  }
}
