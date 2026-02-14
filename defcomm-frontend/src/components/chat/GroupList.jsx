const GroupList = ({ groups, activeGroupId, onSelectGroup }) => {
  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-bold text-black tracking-tight">Groups</h2>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {groups.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8 italic">
            No groups available
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group._id}
              onClick={() => onSelectGroup(group._id)}
              className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 border border-transparent ${activeGroupId === group._id
                ? 'bg-[#014BAA] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-black'
                }`}
            >
              <div className="font-semibold text-sm truncate">{group.name}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupList;
