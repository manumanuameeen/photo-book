export const SocketEvents = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  NEW_MESSAGE: "new_message",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
  ERROR: "error",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ONLINE_STATUS: "online_status",
} as const;
