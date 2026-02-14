import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { fetchGroups, fetchMessages as fetchMessagesAPI, sendMessage as sendMessageAPI } from "../services/api";
import { AuthContext } from "./AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const groupsData = await fetchGroups();
      setGroups(groupsData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch groups when user changes (logs in)
  useEffect(() => {
    if (user) {
      loadGroups();
    } else {
      setGroups([]);
      setMessages([]);
    }
  }, [user, loadGroups]);

  const loadMessages = useCallback(async (groupId) => {
    try {
      setLoading(true);
      const response = await fetchMessagesAPI(groupId);
      setMessages(response.messages || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (groupId, encryptedText) => {
    try {
      const newMessage = await sendMessageAPI(groupId, encryptedText);
      setMessages((prev) => [...prev, newMessage]);
      setError(null);
      return newMessage;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearChatState = () => {
    setMessages([]);
    setGroups([]);
    setError(null);
    setLoading(false);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      groups,
      loading,
      error,
      loadGroups,
      loadMessages,
      sendMessage,
      addMessage,
      clearChatState
    }}>
      {children}
    </ChatContext.Provider>
  );
};

