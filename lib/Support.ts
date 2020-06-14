import dns from "dns";

export abstract class Support {
  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  public static async dnsLookup(hostname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, (error, address) => {
        if (error) {
          reject(error);
        }
        resolve(address);
      });
    });
  }
}
