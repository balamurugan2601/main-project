// Dashboard Alert Card
const AlertCard = ({ type, message }) => {
  const colors = {
    warning: "bg-yellow-900 text-yellow-200 border-yellow-700",
    error: "bg-red-900 text-red-200 border-red-700",
    info: "bg-blue-900 text-blue-200 border-blue-700",
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type] || colors.info} mb-4`}>
      <div className="font-bold capitalize">{type}</div>
      <div>{message}</div>
    </div>
  );
};

export default AlertCard;
