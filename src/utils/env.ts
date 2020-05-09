import { resolve } from "path"
import { config } from "dotenv"
let path;
switch (process.env.NODE_ENV) {
  case "rinbeky":
    path = resolve(__dirname, "../../rinbeky.env");
    break;
  case "mainnet":
    path = resolve(__dirname, "../../.env");
    break;
  case "develop":
    path = resolve(__dirname, "../../develop.env");
    break;
  case "kovan":
    path = resolve(__dirname, "../../kovan.env");
    break;
  default:
    path = resolve(__dirname, "../../.env");
}

config({ path: path });
