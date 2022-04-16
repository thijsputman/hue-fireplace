import { ISocket } from "./ISocket.js";
import { IColour } from "./IColour.js";
import WebSocket, { WebSocketServer } from "ws";

export class TestSocket implements ISocket {
  private mainLoop: (socket: ISocket) => void;
  private wsServer: WebSocketServer;
  private ws: WebSocket;

  public connect() {
    this.wsServer = new WebSocketServer({ port: 8099 });

    this.wsServer.on("connection", ws => {
      this.ws = ws;
      this.mainLoop(this);
    });
  }

  public async close() {
    await this.ws.close();
  }

  public sendColour(colour: IColour) {
    const data = [colour.red, colour.green, colour.blue];

    try {
      this.ws.send(Buffer.from(data));
      console.log(Date.now(), data);
    } catch (error) {
      if (this.ws.readyState >= 2) {
        console.log("closed");
        throw error;
      } else {
        console.log(error);
      }
    }
  }

  public onClientConnect(mainLoop: (socket: ISocket) => void) {
    this.mainLoop = mainLoop;
  }
}
