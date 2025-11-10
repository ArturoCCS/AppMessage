import { Buffer } from "buffer";
import "react-native-get-random-values";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}
if (typeof global.process === "undefined") {
  // @ts-expect-error global typing
  global.process = { env: {} };
}

if (typeof global.atob === "undefined") {
  global.atob = (data: string) => Buffer.from(data, "base64").toString("binary");
}
if (typeof global.btoa === "undefined") {
  global.btoa = (data: string) => Buffer.from(data, "binary").toString("base64");
}

export { };
