import { Socket } from "socket.io";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthSocket extends Socket {
  user?: JWTPayload;
}

export const socketAuthMiddleware = (socket: AuthSocket, next: (err?: Error) => void) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = parse(socket.handshake.headers.cookie);
      token = cookies.accessToken;
    }

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;

    socket.user = decoded;

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};

function parse(str: string) {
  const obj: Record<string, string> = {};
  const pairs = str.split(/; */);

  for (const pair of pairs) {
    const eq_idx = pair.indexOf("=");
    if (eq_idx < 0) continue;
    const key = pair.substr(0, eq_idx).trim();
    let val = pair.substr(eq_idx + 1, pair.length).trim();
    if (val[0] === String.fromCharCode(34)) val = val.slice(1, -1);
    obj[key] = val;
  }
  return obj;
}
