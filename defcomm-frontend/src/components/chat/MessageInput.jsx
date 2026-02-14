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
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white border-t border-gray-200 rounded-b-lg">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? "Select a group to start messaging" : "Type a message..."}
        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-6 py-2 bg-[#014BAA] hover:bg-[#013B8A] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
