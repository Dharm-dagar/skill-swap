import express from "express";
import { sendMessage, getMessages, sendCallRequestMessage } from "../controllers/message.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/sendMessage", verifyJWT_username, sendMessage);
router.post("/sendCallRequest", verifyJWT_username, sendCallRequestMessage);
router.get("/getMessages/:chatId", verifyJWT_username, getMessages);

export default router;
