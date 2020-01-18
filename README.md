# hue-fireplace

Using two Hue Play Lightbar to spice up my fireplace 🔥

## Usage

1. `npm install`
2. Create a `.fireplace.json` configuration file
3. `npm run start`
4. To stop, press `CTRL+C`

### 📄 .fireplace.json

```jsonc
{
  "bridge": "<bridge IP / hostname>",
  "userName": "<Hue API username>",
  "clientKey": "<Hue API key>",
  "lightGroup": 1, // ID of light group to address
  "lights": [1, 2] // IDs of light(s) to address
}
```

## Usage Without a Hue Bridge

Instead of running `npm run start`, run `npm run start:local`.

This will open a new browser window and animate a coloured square using
WebSocket as-if it were a Hue lamp. If it doesn't start automatically, you might
need to press `F5` to reload the browser window.

Use `CTRL+C` (on the console) to stop.

## Findings Thus Far

Contrary to what the API indicates, RGB-values appear to be 8-bit, not 16-bit
(makes sense, but still: "Every individual color component has a 16 bit
resolution on the API" &ndash; no, they do not). The second octet of each RGB-
component is ignored. Attempting to pass a full 16-bit colour value causes the
lights to go bonkers...

## References

- https://developers.meethue.com/develop/hue-entertainment/philips-hue-entertainment-api/
- https://github.com/AlCalzone/node-dtls-client
- https://github.com/Fabiantjoeaon/ableton-hue-project
- https://cpldcpu.wordpress.com/2016/01/05/reverse-engineering-a-real-candle/
