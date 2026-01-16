// // components/CalendarView.jsx
// import React, { useState } from 'react';
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
//          isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
// import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

// const CalendarView = ({ tasks }) => {
//     const [currentDate, setCurrentDate] = useState(new Date());

//     // Get days in month
//     const monthStart = startOfMonth(currentDate);
//     const monthEnd = endOfMonth(currentDate);
//     const startDate = startOfWeek(monthStart);
//     const endDate = endOfWeek(monthEnd);
    
//     const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

//     // Get tasks for a specific date
//     const getTasksForDate = (date) => {
//         return tasks.filter(task => {
//             if (!task.dueDate) return false;
//             try {
//                 const taskDate = new Date(task.dueDate);
//                 return isSameDay(taskDate, date);
//             } catch (error) {
//                 return false;
//             }
//         });
//     };

//     // Get status color
//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'Completed': return 'bg-green-100 text-green-800';
//             case 'In Progress': return 'bg-blue-100 text-blue-800';
//             case 'Pending': return 'bg-amber-100 text-amber-800';
//             default: return 'bg-gray-100 text-gray-800';
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'Completed': return <CheckCircle className="w-3 h-3" />;
//             case 'In Progress': return <Clock className="w-3 h-3" />;
//             case 'Pending': return <AlertCircle className="w-3 h-3" />;
//             default: return null;
//         }
//     };

//     // Navigate months
//     const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
//     const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

//     // Day names
//     const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//     // If no tasks with due dates
//     if (tasks.length === 0) {
//         return (
//             <div className="bg-white rounded-xl p-8 text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                     <CalendarIcon className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks with Due Dates</h3>
//                 <p className="text-gray-500 mb-4">
//                     Tasks without due dates won't appear on the calendar. Add due dates to see them here.
//                 </p>
//                 <div className="text-sm text-gray-400">
//                     Switch to List view to see all tasks
//                 </div>
//             </div>
//         );
//     }

//     // Find month with tasks
//     const hasTasksInCurrentMonth = tasks.some(task => {
//         if (!task.dueDate) return false;
//         try {
//             const taskDate = new Date(task.dueDate);
//             return isSameMonth(taskDate, currentDate);
//         } catch (error) {
//             return false;
//         }
//     });

//     return (
//         <div className="bg-white rounded-xl p-4">
//             {/* Calendar Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={prevMonth}
//                         className="p-2 hover:bg-gray-100 rounded-lg"
//                     >
//                         <ChevronLeft className="w-5 h-5 text-gray-600" />
//                     </button>
//                     <h3 className="text-lg font-semibold text-gray-900">
//                         {format(currentDate, 'MMMM yyyy')}
//                     </h3>
//                     <button
//                         onClick={nextMonth}
//                         className="p-2 hover:bg-gray-100 rounded-lg"
//                     >
//                         <ChevronRight className="w-5 h-5 text-gray-600" />
//                     </button>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                     {tasks.length} task{tasks.length !== 1 ? 's' : ''} with due dates
//                     {!hasTasksInCurrentMonth && (
//                         <span className="ml-2 text-amber-600">• No tasks this month</span>
//                     )}
//                 </div>
//             </div>

//             {/* Day Names */}
//             <div className="grid grid-cols-7 gap-1 mb-2">
//                 {dayNames.map(day => (
//                     <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
//                         {day}
//                     </div>
//                 ))}
//             </div>

//             {/* Calendar Grid */}
//             <div className="grid grid-cols-7 gap-1">
//                 {daysInMonth.map(day => {
//                     const isCurrentMonth = isSameMonth(day, currentDate);
//                     const isToday = isSameDay(day, new Date());
//                     const dayTasks = getTasksForDate(day);
                    
//                     return (
//                         <div
//                             key={day.toString()}
//                             className={`min-h-28 p-2 border rounded-lg transition-colors ${
//                                 !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
//                             } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
//                         >
//                             <div className="flex justify-between items-start mb-1">
//                                 <span className={`text-sm font-medium ${
//                                     !isCurrentMonth ? 'text-gray-400' : 
//                                     isToday ? 'text-blue-600' : 'text-gray-900'
//                                 }`}>
//                                     {format(day, 'd')}
//                                 </span>
//                                 {dayTasks.length > 0 && (
//                                     <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
//                                         {dayTasks.length}
//                                     </span>
//                                 )}
//                             </div>

//                             {/* Tasks for this day */}
//                             <div className="space-y-1 overflow-y-auto max-h-20">
//                                 {dayTasks.slice(0, 3).map(task => (
//                                     <div
//                                         key={task._id}
//                                         className={`text-xs px-2 py-1 rounded flex items-center justify-between ${getStatusColor(task.status)}`}
//                                         title={`${task.title} - ${task.status}`}
//                                     >
//                                         <span className="truncate mr-1">{task.title}</span>
//                                         {getStatusIcon(task.status)}
//                                     </div>
//                                 ))}
//                                 {dayTasks.length > 3 && (
//                                     <div className="text-xs text-gray-500 text-center">
//                                         +{dayTasks.length - 3} more
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Legend */}
//             <div className="mt-6 pt-4 border-t border-gray-200">
//                 <h4 className="text-sm font-medium text-gray-900 mb-3">Task Status Legend</h4>
//                 <div className="flex flex-wrap gap-3">
//                     <div className="flex items-center space-x-1.5">
//                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                         <span className="text-xs text-gray-600">Completed</span>
//                     </div>
//                     <div className="flex items-center space-x-1.5">
//                         <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                         <span className="text-xs text-gray-600">In Progress</span>
//                     </div>
//                     <div className="flex items-center space-x-1.5">
//                         <div className="w-3 h-3 rounded-full bg-amber-500"></div>
//                         <span className="text-xs text-gray-600">Pending</span>
//                     </div>
//                     <div className="flex items-center space-x-1.5">
//                         <div className="w-3 h-3 rounded-full border-2 border-blue-500"></div>
//                         <span className="text-xs text-gray-600">Today</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Stats */}
//             <div className="mt-4 text-xs text-gray-500">
//                 <p>Tasks without due dates are not shown on the calendar. Edit tasks to add due dates.</p>
//             </div>
//         </div>
//     );
// };

// export default CalendarView;

// components/CalendarView.jsx
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, Calendar as CalendarIcon, Info } from 'lucide-react';

const CalendarView = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get days in month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            try {
                const taskDate = new Date(task.dueDate);
                return isSameDay(taskDate, date);
            } catch (error) {
                return false;
            }
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-3 h-3" />;
            case 'In Progress': return <Clock className="w-3 h-3" />;
            case 'Pending': return <AlertCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    // Navigate months
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // If no tasks with due dates
    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Tasks with Due Dates</h3>
                <p className="text-sm text-gray-500 mb-4 px-2">
                    Tasks without due dates won't appear on the calendar. Add due dates to see them here.
                </p>
                <div className="text-xs sm:text-sm text-gray-400">
                    Switch to List view to see all tasks
                </div>
            </div>
        );
    }

    // Find month with tasks
    const hasTasksInCurrentMonth = tasks.some(task => {
        if (!task.dueDate) return false;
        try {
            const taskDate = new Date(task.dueDate);
            return isSameMonth(taskDate, currentDate);
        } catch (error) {
            return false;
        }
    });

    return (
        <div className="bg-white rounded-xl p-3 sm:p-4">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mx-2 sm:mx-4">
                        {format(currentDate, 'MMMM yyyy')}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-full sm:w-auto text-center sm:text-left">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} with due dates
                    {!hasTasksInCurrentMonth && (
                        <span className="ml-2 text-amber-600">• No tasks this month</span>
                    )}
                </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                        {day.substring(0, 1)}
                        <span className="hidden sm:inline">{day.substring(1)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {daysInMonth.map(day => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayTasks = getTasksForDate(day);
                    
                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-20 sm:min-h-28 p-1 sm:p-2 border rounded-lg transition-colors ${
                                !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                            } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                                <span className={`text-xs sm:text-sm font-medium ${
                                    !isCurrentMonth ? 'text-gray-400' : 
                                    isToday ? 'text-blue-600' : 'text-gray-900'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 px-1 sm:px-1.5 py-0.5 rounded-full">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            {/* Tasks for this day */}
                            <div className="space-y-0.5 sm:space-y-1 overflow-hidden max-h-16 sm:max-h-20">
                                {dayTasks.slice(0, 2).map(task => (
                                    <div
                                        key={task._id}
                                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center justify-between ${getStatusColor(task.status)} border`}
                                        title={`${task.title} - ${task.status}`}
                                    >
                                        <span className="truncate mr-0.5 sm:mr-1">{task.title.substring(0, 8)}{task.title.length > 8 ? '...' : ''}</span>
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(task.status)}
                                        </div>
                                    </div>
                                ))}
                                {dayTasks.length > 2 && (
                                    <div className="text-[10px] sm:text-xs text-gray-500 text-center bg-gray-50 px-1 py-0.5 rounded">
                                        +{dayTasks.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex items-center mb-2 sm:mb-3">
                    <Info className="w-4 h-4 text-gray-400 mr-2" />
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900">Task Status Legend</h4>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-blue-500"></div>
                        <span className="text-xs text-gray-600">Today</span>
                    </div>
                </div>
            </div>

            {/* Note about tasks without dates */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-amber-700">
                        Tasks without due dates are not shown on the calendar. Edit tasks to add due dates.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;