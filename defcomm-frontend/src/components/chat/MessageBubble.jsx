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
        className={`rounded-lg p-3 max-w-xs ${isCurrentUser ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200'
          }`}
      >
        <div className="text-xs text-gray-400 mb-1">{senderName}</div>
        <div className="break-words">{decryptedText}</div>
        <div className="text-xs text-gray-500 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  );
};

export default MessageBubble;