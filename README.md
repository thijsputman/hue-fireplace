# hue-fireplace

Using a Hue Play Lightbar to spice up my fireplace.

## Findings Thus Far
Contrary to what the API indicates, RGB-values appear to be 8-bit, not 16-bit
(makes sense, but still: "Every individual color component has a 16 bit
resolution on the API" &ndash; no, they do not). The second octect of each RGB-
component is ignored. Attempting to pass a full 16-bit colour value causes the
lights to go bonkers...

## References

* https://developers.meethue.com/develop/hue-entertainment/philips-hue-entertainment-api/
* https://github.com/AlCalzone/node-dtls-client
* https://github.com/Fabiantjoeaon/ableton-hue-project
* https://cpldcpu.wordpress.com/2016/01/05/reverse-engineering-a-real-candle/
