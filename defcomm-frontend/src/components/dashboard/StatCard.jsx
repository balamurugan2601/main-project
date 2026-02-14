// Dashboard Stat Card
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <span className="text-green-500 text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      {trend && (
        <p className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}% from last month
        </p>
      )}
    </div>
  );
};

export default StatCard;
