const DateSeparator = ({ date }) => {
    const formatDate = (dateObj) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (isNaN(dateObj.getTime())) {
            return null;
        }

        if (dateObj.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (dateObj.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const formattedDate = formatDate(date);
    if (!formattedDate) return null;

    return (
        <div className="flex justify-center my-4">
            <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {formattedDate}
            </div>
        </div>
    );
};

export default DateSeparator;
