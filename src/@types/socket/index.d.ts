import { UserPublicForeign } from "qhunt-lib";
import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    auth?: UserPublicForeign;
  }
}
