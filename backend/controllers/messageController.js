import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: { $in: [req.user._id] } })
    .populate('participants', 'name email profilePicture role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
  success(res, { data: conversations });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('_id name role profilePicture');
  success(res, { data: users });
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.conversationId })
    .populate('sender', 'name email profilePicture')
    .sort({ createdAt: 1 });
  success(res, { data: messages });
});

export const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === receiverId) {
    return error(res, 'Cannot create conversation with yourself', 400);
  }

  let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } })
    .populate('participants', 'name email profilePicture role');

  if (conversation) return success(res, { data: conversation });

  conversation = await Conversation.create({ participants: [senderId, receiverId] });
  conversation = await conversation.populate('participants', 'name email profilePicture role');

  res.status(201).json({ success: true, data: conversation });
});
