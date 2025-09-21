import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

export const createRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside createRequest Controller function ********");

  const { receiverID } = req.body;
  const senderID = req.user._id;

  console.log("Sender ID: ", senderID);
  console.log("Receiver ID: ", receiverID);

  const existingRequest = await Request.find({ sender: senderID, receiver: receiverID });

  if (existingRequest.length > 0) {
    throw new ApiError(400, "Request already exists");
  }

  // Create the request
  const request = await Request.create({
    sender: senderID,
    receiver: receiverID,
  });

  if (!request) return next(new ApiError(500, "Request not created"));

  // Check if chat already exists between these users
  let existingChat = await Chat.findOne({ 
    users: { $all: [senderID, receiverID] } 
  });

  // If no chat exists, create one
  if (!existingChat) {
    existingChat = await Chat.create({
      users: [senderID, receiverID],
    });

    if (!existingChat) {
      return next(new ApiError(500, "Chat not created"));
    }
  }

  // Get sender details for the message
  const sender = await User.findById(senderID).select("name username");
  
  // Create an initial message about the request
  const requestMessage = await Message.create({
    chatId: existingChat._id,
    sender: senderID,
    content: `🔔 Connection Request: ${sender.name} (@${sender.username}) wants to connect with you! This request is pending your approval.`,
  });

  console.log("Created request message:", requestMessage);

  // Update the chat with the latest message
  await Chat.findByIdAndUpdate(existingChat._id, {
    latestMessage: requestMessage._id,
  });

  console.log("Updated chat with latest message:", existingChat._id);

  res.status(201).json(new ApiResponse(201, { request, chat: existingChat, message: requestMessage }, "Request created successfully and chat initiated"));
});

export const getRequests = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside getRequests Controller function ********");

  const receiverID = req.user._id;

  const requests = await Request.find({ receiver: receiverID, status: "Pending" }).populate("sender");

  if (requests.length > 0) {
    const sendersDetails = requests.map((request) => {
      return request._doc.sender;
    });
    return res.status(200).json(new ApiResponse(200, sendersDetails, "Requests fetched successfully"));
  }

  return res.status(200).json(new ApiResponse(200, requests, "Requests fetched successfully"));
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside acceptRequest Controller function ********");

  const { requestId } = req.body;
  const receiverId = req.user._id;

  // console.log("RequestId: ", requestId);
  // console.log("Receiver ID: ", receiverId);

  const existingRequest = await Request.findOne({ sender: requestId, receiver: receiverId, status: "Pending" });

  // console.log("Existing Request: ", existingRequest);

  if (!existingRequest) {
    throw new ApiError(400, "Request does not exist or already processed");
  }

  // Find the existing chat (it should exist from when request was created)
  let chat = await Chat.findOne({ users: { $all: [requestId, receiverId] } });

  // If chat doesn't exist, create one (fallback)
  if (!chat) {
    chat = await Chat.create({
      users: [requestId, receiverId],
    });

    if (!chat) return next(new ApiError(500, "Chat not created"));
  }

  // Get receiver details for the message
  const receiver = await User.findById(receiverId).select("name username");
  
  // Create an acceptance message
  const acceptanceMessage = await Message.create({
    chatId: chat._id,
    sender: receiverId,
    content: `✅ Connection Accepted: ${receiver.name} (@${receiver.username}) has accepted your connection request! You can now start chatting.`,
  });

  // Update the chat with the latest message
  await Chat.findByIdAndUpdate(chat._id, {
    latestMessage: acceptanceMessage._id,
  });

  // Update the request status
  await Request.findByIdAndUpdate(existingRequest._id, {
    status: "Connected",
  });

  res.status(201).json(new ApiResponse(201, { chat, message: acceptanceMessage }, "Request accepted successfully"));
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside rejectRequest Controller function ********");

  const { requestId } = req.body;
  const receiverId = req.user._id;

  // console.log("RequestId: ", requestId);
  // console.log("Receiver ID: ", receiverId);

  const existingRequest = await Request.findOne({ sender: requestId, receiver: receiverId, status: "Pending" });

  // console.log("Existing Request: ", existingRequest);

  if (!existingRequest) {
    throw new ApiError(400, "Request does not exist or already processed");
  }

  // Find the existing chat
  const chat = await Chat.findOne({ users: { $all: [requestId, receiverId] } });

  if (chat) {
    // Get receiver details for the message
    const receiver = await User.findById(receiverId).select("name username");
    
    // Create a rejection message
    const rejectionMessage = await Message.create({
      chatId: chat._id,
      sender: receiverId,
      content: `❌ Connection Declined: ${receiver.name} (@${receiver.username}) has declined your connection request.`,
    });

    // Update the chat with the latest message
    await Chat.findByIdAndUpdate(chat._id, {
      latestMessage: rejectionMessage._id,
    });
  }

  // Update the request status
  await Request.findByIdAndUpdate(existingRequest._id, { status: "Rejected" });

  res.status(200).json(new ApiResponse(200, null, "Request rejected successfully"));
});
