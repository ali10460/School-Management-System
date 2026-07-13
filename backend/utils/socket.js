import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // User joins a room specific to their ID
    socket.join(socket.user.id);

    socket.on('sendMessage', async (data, callback) => {
      try {
        const { conversationId, receiverId, text } = data;

        // Save message to database
        const newMessage = await Message.create({
          conversationId,
          sender: socket.user.id,
          text,
        });

        const populatedMessage = await newMessage.populate('sender', 'name email profilePicture');

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        // Emit to receiver's room
        io.to(receiverId).emit('newMessage', populatedMessage);
        
        // Acknowledge back to sender
        if (callback) callback({ success: true, message: populatedMessage });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
