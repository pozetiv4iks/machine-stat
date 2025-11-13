"use client";

import { useEffect, useState, useRef } from "react";
import { getChats, getChatMessages, sendMessage, getUsers, type Chat, type Message, type User } from "@/assets/api";

const CURRENT_USER_ID = 1; // ID текущего пользователя

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChats(CURRENT_USER_ID);
      setChats(data);
    } catch (err) {
      setError("Не удалось загрузить чаты");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Не удалось загрузить пользователей", err);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      setMessagesLoading(true);
      const data = await getChatMessages(chatId);
      setMessages(data);
    } catch (err) {
      console.error("Не удалось загрузить сообщения", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(selectedChat.id, CURRENT_USER_ID, newMessage.trim());
      setNewMessage("");
      await loadMessages(selectedChat.id);
      await loadChats(); // Обновляем список чатов для обновления last_message
    } catch (err) {
      console.error("Не удалось отправить сообщение", err);
      alert("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatUser = (chat: Chat): User | undefined => {
    const otherUserId = chat.user1_id === CURRENT_USER_ID ? chat.user2_id : chat.user1_id;
    return users.find(u => u.id === otherUserId);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      } else if (days === 1) {
        return "Вчера";
      } else if (days < 7) {
        return date.toLocaleDateString("ru-RU", { weekday: "short" });
      } else {
        return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      }
    } catch {
      return dateString;
    }
  };

  if (selectedChat) {
    const chatUser = getChatUser(selectedChat);

    return (
      <div className="min-h-screen bg-white pb-20 flex flex-col">
        {/* Мягкие размытые зеленые области на заднем плане */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute rounded-full bg-[#DBEDAE]"
            style={{
              width: '700px',
              height: '700px',
              filter: 'blur(100px)',
              opacity: 0.5,
              top: '-250px',
              left: '-250px',
            }}
          />
          <div 
            className="absolute rounded-full bg-[#DBEDAE]"
            style={{
              width: '700px',
              height: '700px',
              filter: 'blur(100px)',
              opacity: 0.5,
              bottom: '-250px',
              right: '-250px',
            }}
          />
        </div>

        {/* Заголовок чата */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedChat(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-black">
              {chatUser?.full_name || chatUser?.username || "Пользователь"}
            </h2>
            <p className="text-sm text-gray-500">{chatUser?.role || ""}</p>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto px-4 py-4 relative z-10">
          {messagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Загрузка сообщений...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500 text-center">
                <p>Нет сообщений</p>
                <p className="text-sm mt-2">Начните общение!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === CURRENT_USER_ID;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-[#DBEDAE] text-black"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-gray-600" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Поле ввода */}
        <div className="sticky bottom-0 z-20 px-4 py-3 relative">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Написать сообщение..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black"
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-[#DBEDAE] text-black rounded-full hover:bg-[#DBEDAE]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <svg
                  className="w-6 h-6 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute rounded-full bg-[#DBEDAE]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            top: '-250px',
            left: '-250px',
          }}
        />
        <div 
          className="absolute rounded-full bg-[#DBEDAE]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            bottom: '-250px',
            right: '-250px',
          }}
        />
      </div>

      <div className="px-4 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-16">Чаты</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">Загрузка чатов...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadChats}
              className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">У вас пока нет чатов</p>
            <p className="text-sm text-gray-400">Начните общение с пользователями!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const chatUser = getChatUser(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Аватар */}
                    <div className="w-12 h-12 rounded-full bg-[#DBEDAE] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-black">
                        {(chatUser?.full_name || chatUser?.username || "?")[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Информация о чате */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-black truncate">
                          {chatUser?.full_name || chatUser?.username || "Пользователь"}
                        </h3>
                        {chat.last_message && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(chat.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.last_message?.text || "Нет сообщений"}
                        </p>
                        {chat.unread_count && chat.unread_count > 0 && (
                          <span className="ml-2 bg-[#DBEDAE] text-black text-xs font-semibold rounded-full px-2 py-0.5 flex-shrink-0">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

