// Generic Input Component
const Input = ({ label, type = "text", value, onChange, placeholder, required = false, className = "" }) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-2 text-sm font-medium text-gray-300">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
      />
    </div>
  );
};

export default Input;
