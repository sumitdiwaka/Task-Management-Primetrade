import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const CalendarView = ({ tasks }) => {
    const days = eachDayOfInterval({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
    });

    return (
        <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl shadow-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center font-bold text-gray-500 text-sm">{d}</div>
            ))}
            {days.map(day => (
                <div key={day.toString()} className="border h-24 p-1 overflow-y-auto rounded">
                    <span className="text-xs text-gray-400">{format(day, 'd')}</span>
                    {tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day)).map(t => (
                        <div key={t._id} className="text-[10px] bg-blue-100 text-blue-700 p-1 mb-1 rounded truncate">
                            {t.title}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CalendarView;