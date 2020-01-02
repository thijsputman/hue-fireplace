export abstract class Support {
  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
