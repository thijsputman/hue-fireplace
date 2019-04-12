import { IColour } from "./IColour";

export interface ISocket {
    connect(): void;

    // TODO: This should be async...
    close(): void;

    sendColour(colour: IColour): void;

    onclientConnect(mainLoop: (socket: ISocket) => void): void;
}
