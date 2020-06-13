import chalk from "chalk";
import { IColour } from "./IColour";

export abstract class HueConsole {
  public static logFrame(frameCounter: number, colour: IColour) {
    console.log(
      frameCounter,
      chalk
        .rgb(colour.red, colour.green, colour.blue)
        .inverse(JSON.stringify(colour))
    );
  }
}
