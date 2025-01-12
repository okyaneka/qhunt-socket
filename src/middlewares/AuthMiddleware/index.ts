import { UserPublicService } from "qhunt-lib/services";
import { log, SocketHandler } from "~/helpers";
import { parse } from "cookie";
import { UserPublicForeignValidator } from "qhunt-lib/validators/UserPublicValidator";

const AuthMiddleware: SocketHandler = async (socket, next) => {
  const {
    handshake: {
      headers: { cookie: cookieString },
    },
  } = socket;
  if (!cookieString) {
    const message = "invalid credentials";
    log.error(socket, message);
    return next(new Error(message));
  }

  const { tid } = parse(cookieString) as { tid: string };
  const user = await UserPublicService.verify(tid).catch((err: Error) => err);

  if (user instanceof Error) {
    log.error(socket, user.message);
    return next(new Error(user.message));
  }

  const { value, error } = UserPublicForeignValidator.validate(user, {
    stripUnknown: true,
  });
  if (error) {
    log.error(socket, error.message);
    return next(new Error(error.message));
  }
  socket.auth = value;

  next();
};

export default AuthMiddleware;
