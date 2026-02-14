import { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageInput from "../../components/chat/MessageInput";
import GroupList from "../../components/chat/GroupList";
import { useChat } from "../../context/useChat";
import { useAuth } from "../../context/useAuth";

const Chat = () => {
  const { user } = useAuth();
  const { messages, groups, loading, error, loadMessages, sendMessage } = useChat();
  const [activeGroupId, setActiveGroupId] = useState(null);
  const bottomRef = useRef(null);

  // Set initial active group when groups load
  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0]._id);
    }
  }, [groups, activeGroupId]);

  // Load messages when active group changes
  useEffect(() => {
    if (activeGroupId) {
      loadMessages(activeGroupId);
    }
  }, [activeGroupId, loadMessages]);

  // Auto-scroll to bottom only when a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSelectGroup = (groupId) => {
    setActiveGroupId(groupId);
  };

  const handleSend = async (encryptedText) => {
    if (!activeGroupId) return;

    try {
      await sendMessage(activeGroupId, encryptedText);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const activeGroup = groups?.find((g) => (g._id === activeGroupId || g.id === activeGroupId));

  if (loading && groups.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex gap-4 h-full min-h-0">
        {error && (
          <div className="absolute top-4 right-4 bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded z-50">
            {error}
          </div>
        )}

        <GroupList
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={handleSelectGroup}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-gray-900 p-4 rounded-lg mb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-green-400">
              {activeGroup?.name || "Chat"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 bg-gray-900 p-4 rounded-lg min-h-0">
            {loading && messages.length === 0 ? (
              <div className="text-center text-gray-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id || message._id}
                  message={message}
                  currentUserId={user?._id || user?.id}
                  senderName={
                    typeof (message.sender?.username || message.senderId) === 'object'
                      ? (message.sender?.username || 'Unknown')
                      : (message.sender?.username || message.senderId || 'Unknown')
                  }
                />
              ))
            )}
            <div ref={bottomRef} className="h-px" />
          </div>

          <div className="flex-shrink-0">
            <MessageInput onSend={handleSend} disabled={!activeGroupId} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
