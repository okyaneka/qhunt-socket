import { UserPublicForeign } from "qhunt-lib/models/UserPublicModel";
import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    auth?: UserPublicForeign;
  }
}
