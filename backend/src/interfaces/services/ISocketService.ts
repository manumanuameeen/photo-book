import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export interface ISocketService {
  init(httpServer: HttpServer): void;
  getIO(): Server;
  emitToUser<T>(userId: string, event: string, data: T): void;
}
