import { Platform } from "react-native";

if (Platform.OS === "web") {
  require("./polyfills.web");
} else {
  require("./polyfills.native");
}

export { };
