// Dashboard User Approval Card
const UserApprovalCard = ({ user, onApprove, onReject }) => {
  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-2">
      <div>
        <h4 className="font-bold text-white">{user.name}</h4>
        <p className="text-sm text-gray-400">{user.email}</p>
        <div className="text-xs text-blue-400 mt-1">{user.department}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(user.id)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(user.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default UserApprovalCard;
