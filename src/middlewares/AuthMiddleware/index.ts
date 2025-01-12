import { UserPublicService } from "qhunt-lib/services";
import { SocketHandler } from "~/helpers";

const AuthMiddleware: SocketHandler = async (socket, next) => {
  const { headers } = socket.handshake;
  const { code } = headers;
  const user = await UserPublicService.verify(code as string).catch(
    (err: Error) => err
  );
  if (user instanceof Error) return next(new Error(user.message));
  next();
};

export default AuthMiddleware;
