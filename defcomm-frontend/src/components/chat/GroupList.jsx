const GroupList = ({ groups, activeGroupId, onSelectGroup }) => {
  return (
    <div className="w-60 bg-gray-900 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-green-400 mb-4">Groups</h2>
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-10rem)]">
        {groups.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            No groups available
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group._id}
              onClick={() => onSelectGroup(group._id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeGroupId === group._id
                  ? 'bg-gray-800 text-green-400'
                  : 'text-gray-300 hover:bg-gray-800'
                }`}
            >
              {group.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupList;
