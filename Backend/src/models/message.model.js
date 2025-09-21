import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "callRequest"],
      default: "text",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
