import { IColour } from "./IColour.js";

export interface ISocket {
  connect(): void;

  // TODO: This should be async...
  close(): void;

  sendColour(colour: IColour): void;

  onClientConnect(mainLoop: (socket: ISocket) => void): void;
}
