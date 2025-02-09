import { UserPublicService } from "qhunt-lib/services";
import { log, SocketHandler } from "~/helpers";
import { parse } from "cookie";
import { UserPublicForeignValidator } from "qhunt-lib/validators/user-public";

const AuthMiddleware: SocketHandler = async (socket, next) => {
  const {
    handshake: {
      headers: { cookie: cookieString },
    },
  } = socket;
  if (!cookieString) {
    const error = new Error("invalid credentials");
    log.error(socket, error);
    return next(error);
  }

  const { TID_SOCKET: TID } = parse(cookieString) as { TID_SOCKET: string };
  const user = await UserPublicService.verify(TID).catch((err: Error) => err);

  if (user instanceof Error) {
    log.error(socket, user);
    return next(new Error(user.message));
  }

  const { value, error } = UserPublicForeignValidator.validate(user, {
    stripUnknown: true,
  });
  if (error) {
    log.error(socket, error);
    return next(new Error(error.message));
  }
  socket.auth = value;

  next();
};

export default AuthMiddleware;
