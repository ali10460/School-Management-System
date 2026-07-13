import { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => { loadConversations(); loadUsers(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (activeConversation && message.conversationId === activeConversation._id) {
          setMessages((prev) => [...prev, message]);
        }
        loadConversations();
      });
    }
    return () => { if (socket) socket.off('newMessage'); };
  }, [socket, activeConversation]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try { const res = await messageService.getConversations(); setConversations(res.data.data); }
    catch {} finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try { const res = await messageService.getUsers(); setUsers(res.data.data); } catch {}
  };

  const loadMessages = async (conversation) => {
    try {
      setActiveConversation(conversation);
      const res = await messageService.getMessages(conversation._id);
      setMessages(res.data.data);
    } catch { console.error('Failed to load messages'); }
  };

  const startConversation = async (receiverId) => {
    try {
      const res = await messageService.createConversation({ receiverId });
      loadConversations();
      loadMessages(res.data.data);
      setSearchQuery('');
    } catch { console.error('Failed to start conversation'); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;
    const currentUserId = user._id || user.id;
    const receiver = activeConversation.participants.find(p => p._id !== currentUserId);
    const messageData = { conversationId: activeConversation._id, receiverId: receiver._id, text: newMessage };
    socket.emit('sendMessage', messageData, (response) => {
      if (response.success) {
        setMessages((prev) => [...prev, response.message]);
        setNewMessage('');
        loadConversations();
      }
    });
  };

  const currentUserId = user._id || user.id;
  const filteredUsers = (users || []).filter(u =>
    u._id !== currentUserId && u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-10rem)] bg-white dark:bg-surface-800/90 rounded-2xl shadow-lg border border-surface-100 dark:border-surface-700/50 overflow-hidden animate-fade-in">
        {/* Sidebar */}
        <div className="w-full sm:w-72 lg:w-80 border-r border-surface-200/50 dark:border-surface-700/50 flex flex-col bg-surface-50/50 dark:bg-surface-900/30">
          <div className="p-4 border-b border-surface-200/50 dark:border-surface-700/50">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input type="text" placeholder="Search users..." className="input-field pl-9 py-2 text-sm"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <LoadingSpinner className="py-12" />
            ) : searchQuery ? (
              <div className="p-2 space-y-0.5">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-sm text-surface-400 py-8">No users found</p>
                ) : filteredUsers.map(u => (
                  <button key={u._id} onClick={() => startConversation(u._id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-surface-700/60 transition-all text-left">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-surface-800 dark:text-surface-100 truncate">{u.name}</p>
                      <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {conversations.length === 0 ? (
                  <p className="text-center text-sm text-surface-400 py-8">No conversations yet</p>
                ) : conversations.map(c => {
                  const other = c.participants?.find(p => p._id !== currentUserId);
                  const isActive = activeConversation?._id === c._id;
                  return (
                    <button key={c._id} onClick={() => loadMessages(c)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-white dark:bg-surface-700 shadow-sm border border-surface-100 dark:border-surface-600' : 'hover:bg-white/60 dark:hover:bg-surface-700/40'}`}>
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-secondary-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {other?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-surface-800 dark:text-surface-100 truncate">{other?.name}</p>
                        <p className={`text-xs truncate ${isActive ? 'text-surface-600 dark:text-surface-300' : 'text-surface-500 dark:text-surface-400'}`}>
                          {c.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden sm:flex flex-1 flex-col">
          {activeConversation ? (
            <>
              <div className="px-6 py-4 border-b border-surface-200/50 dark:border-surface-700/50 bg-white/50 dark:bg-surface-800/50 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-secondary-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {activeConversation.participants?.find(p => p._id !== currentUserId)?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-surface-800 dark:text-white">
                    {activeConversation.participants?.find(p => p._id !== currentUserId)?.name}
                  </h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-surface-400">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : messages.map(m => {
                  const isMine = m.sender?._id === currentUserId;
                  return (
                    <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[75%] px-4 py-2.5 shadow-sm ${isMine
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 rounded-2xl rounded-tl-sm border border-surface-100 dark:border-surface-600'}`}>
                        <p className="text-sm leading-relaxed">{m.text}</p>
                        <p className={`text-[10px] mt-1.5 ${isMine ? 'text-primary-100 text-right' : 'text-surface-400 text-left'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white/80 dark:bg-surface-800/80 border-t border-surface-200/50 dark:border-surface-700/50">
                <form onSubmit={sendMessage} className="flex gap-3 items-center">
                  <input type="text" placeholder="Type your message..."
                    className="flex-1 px-5 py-2.5 rounded-full bg-surface-100 dark:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:text-white transition-all"
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="submit"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-2.5 rounded-full hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!newMessage.trim()}>
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-surface-500 dark:text-surface-400 space-y-4">
              <div className="h-20 w-20 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-surface-300 dark:text-surface-500" />
              </div>
              <p className="text-lg font-semibold">Your Messages</p>
              <p className="text-sm">Select a conversation or search for a user to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
