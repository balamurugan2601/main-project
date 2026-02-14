import { decryptMessage } from '../../utils/encrypt';

const MessageBubble = ({ message, currentUserId, senderName }) => {
  if (!message) return null;
  const decryptedText = message.encryptedText ? decryptMessage(message.encryptedText) : 'No content';
  const isCurrentUser = currentUserId && (currentUserId === message.senderId || currentUserId === message.sender?._id || currentUserId === message.sender?.id);

  const date = new Date(message.timestamp);
  const timestamp = !isNaN(date.getTime())
    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl px-5 py-3 max-w-sm sm:max-w-md shadow-sm border ${isCurrentUser
          ? 'bg-[#014BAA] text-white border-transparent'
          : 'bg-white text-black border-gray-200'
          }`}
      >
        {!isCurrentUser && (
          <div className="text-xs text-[#014BAA] font-bold mb-1">{senderName}</div>
        )}
        <div className="break-words leading-relaxed text-sm">{decryptedText}</div>
        <div className={`text-[10px] mt-1 text-right ${isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>{timestamp}</div>
      </div>
    </div>
  );
};

export default MessageBubble;