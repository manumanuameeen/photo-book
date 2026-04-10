import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  structuredData?: {
    type: "photographer_list" | "package_list" | "booking_confirmation" | "availability_picker";
    photographerId?: string;
    packageId?: string;
    data?: any;
    bookingId?: string;
    [key: string]: any;
  };
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IChatMessage[];
  metadata?: {
    state?: {
      phase:
        | "GREETING"
        | "BROWSING"
        | "COMPARING"
        | "BOOKING_INITIATED"
        | "BOOKING_PENDING"
        | "BOOKING_CONFIRMED";
      selectedPhotographer?: string;
      selectedPackage?: string;
      bookingDetails?: {
        eventDate?: string;
        startTime?: string;
        location?: string;
        eventType?: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
      };
    };
    [key: string]: unknown; // Allow other metadata
  };
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        structuredData: {
          type: Schema.Types.Mixed,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Add index for efficient queries
    indexes: [{ userId: 1, sessionId: 1 }, { lastMessageAt: -1 }],
  },
);

// Compound unique index to prevent duplicate sessions
ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const ChatHistoryModel: Model<IChatHistory> = mongoose.model<IChatHistory>(
  "ChatHistory",
  ChatHistorySchema,
);
