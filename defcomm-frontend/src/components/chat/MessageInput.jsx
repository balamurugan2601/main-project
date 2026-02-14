import { useState } from 'react';
import { encryptMessage } from '../../utils/encrypt';

const MessageInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim() || disabled) return;

    const encryptedText = encryptMessage(text);
    onSend(encryptedText);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-gray-900 border-t border-gray-700">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? "Select a group to start messaging" : "Type a message..."}
        className="flex-1 px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
