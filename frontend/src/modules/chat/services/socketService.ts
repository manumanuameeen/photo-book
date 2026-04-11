import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "https://photobook-api.ddns.net";
class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(token?: string): void {
        console.log("🔌 Connecting socket...", { token: token ? "provided" : "missing" });
        
        if (this.socket) {
            console.log("🔌 Existing socket found, disconnecting...");
            this.socket.disconnect();
            this.socket = null;
        }

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket"],
            autoConnect: true,
            auth: token ? { token } : undefined,
        });

        this.socket.on("connect", () => {
            console.log("✅ Socket connected:", this.socket?.id);
        });

        this.socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
        });

        this.socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public on(event: string, callback: (data: unknown) => void): void {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    public off(event: string, callback?: (data: unknown) => void): void {
        if (!this.socket) return;
        this.socket.off(event, callback);
    }

    public emit(event: string, data: unknown): void {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }
}

export const socketService = SocketService.getInstance();
