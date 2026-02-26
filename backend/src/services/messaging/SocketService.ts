import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware, AuthSocket } from "../../middleware/socketMiddleware.ts";
import { SocketEvents } from "../../constants/socketEvents.ts";
import type { ISocketService } from "../../interfaces/services/ISocketService.ts";

export class SocketService implements ISocketService {
  private static _instance: SocketService;
  private _io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  public init(httpServer: HttpServer): void {
    this._io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    this._io.use(socketAuthMiddleware);

    this._io.on("connection", (socket: Socket) => {
      this._handleConnection(socket as AuthSocket);
    });

    console.log("✅ Socket.IO initialized");
  }

  public getIO(): Server {
    if (!this._io) {
      throw new Error("Socket.IO not initialized. Call init() first.");
    }
    return this._io;
  }

  private _handleConnection(socket: AuthSocket): void {
    const userId = socket.user?.userId;
    if (!userId) {
      console.warn("Socket connected without user ID, disconnecting...");
      socket.disconnect();
      return;
    }

    console.log(`🔌 User connected: ${userId} (Socket ID: ${socket.id})`);

    socket.join(`user:${userId}`);

    socket.on(SocketEvents.TYPING, (data: { receiverId: string }) => {
      this.emitToUser(data.receiverId, SocketEvents.TYPING, { senderId: userId });
    });

    socket.on(SocketEvents.STOP_TYPING, (data: { receiverId: string }) => {
      this.emitToUser(data.receiverId, SocketEvents.STOP_TYPING, { senderId: userId });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userId}`);
    });
  }

  public emitToUser<T>(userId: string, event: string, data: T): void {
    if (this._io) {
      this._io.to(`user:${userId}`).emit(event, data);
    }
  }
}
