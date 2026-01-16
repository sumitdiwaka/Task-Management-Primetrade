import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Search, Filter, LogOut, Plus, Trash2, CheckCircle,
    Calendar, List, ChevronDown, MoreVertical, Edit,
    Clock, AlertCircle, User, Bell, Target, X
} from 'lucide-react';
import { format } from 'date-fns';
import CalendarView from '../components/CalendarView';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [newTask, setNewTask] = useState({ 
        title: '', 
        status: 'Pending',
        dueDate: '' // EMPTY by default - user must choose
    });
    const [view, setView] = useState('list');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [activeTaskMenu, setActiveTaskMenu] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Fetch tasks from backend
    const fetchTasks = async () => {
        try {
            const { data } = await API.get('/tasks');
            // Ensure dueDate is properly formatted
            const formattedData = data.map(task => ({
                ...task,
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
            }));
            setTasks(formattedData);
        } catch (err) {
            console.error("Error fetching tasks", err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Calculate stats
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Filter and Search Logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        setIsAddingTask(true);
        try {
            // Create a temporary task with a temporary ID
            const tempId = Date.now().toString();
            const tempTask = {
                _id: tempId,
                title: newTask.title,
                status: newTask.status,
                dueDate: newTask.dueDate || null, // Allow empty due date
                createdAt: new Date().toISOString(),
                isTemp: true
            };

            // Add to local state immediately (optimistic update)
            setTasks(prev => [tempTask, ...prev]);
            setNewTask({ 
                title: '', 
                status: 'Pending',
                dueDate: '' // Reset to empty
            });

            // Send to backend
            const response = await API.post('/tasks', {
                title: newTask.title,
                status: newTask.status,
                dueDate: newTask.dueDate || null
            });

            // Replace temp task with real task from backend
            setTasks(prev =>
                prev.map(task =>
                    task._id === tempId ? {
                        ...response.data,
                        dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : ''
                    } : task
                )
            );

        } catch (err) {
            console.error("Error adding task", err);
            // Remove temp task if error
            setTasks(prev => prev.filter(task => !task.isTemp));
            alert('Failed to add task. Please try again.');
        } finally {
            setIsAddingTask(false);
        }
    };

    const deleteTask = async (id) => {
        // Close confirmation dialog
        setTaskToDelete(null);
        setActiveTaskMenu(null);
        
        // Optimistic update - remove immediately from UI
        setTasks(prev => prev.filter(task => task._id !== id));

        try {
            await API.delete(`/tasks/${id}`);
        } catch (err) {
            console.error("Error deleting task", err);
            // Re-add task if delete fails
            fetchTasks();
            alert('Failed to delete task. Please try again.');
        }
    };

    const updateTaskStatus = async (id, newStatus) => {
        // Optimistic update
        setTasks(prev =>
            prev.map(task =>
                task._id === id ? { ...task, status: newStatus } : task
            )
        );

        try {
            await API.put(`/tasks/${id}`, { status: newStatus });
        } catch (err) {
            console.error("Error updating task", err);
            // Revert if update fails
            fetchTasks();
        }
    };

    const updateTask = async (id, updates) => {
        try {
            // Optimistic Update
            setTasks(prev => prev.map(t => 
                t._id === id ? { 
                    ...t, 
                    ...updates,
                    dueDate: updates.dueDate || '' // Ensure empty string if no due date
                } : t
            ));
            
            // Close edit modal
            setEditingTask(null);
            
            // Backend Update
            await API.put(`/tasks/${id}`, {
                ...updates,
                dueDate: updates.dueDate || null // Send null for empty due date
            });
        } catch (err) {
            console.error("Error updating task", err);
            fetchTasks(); // Revert on error
            alert('Failed to update task. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'In Progress': return <Clock className="w-4 h-4" />;
            case 'Pending': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // Status options for the edit modal
    const statusOptions = [
        { value: 'Pending', label: 'Pending', color: 'bg-amber-500', icon: <AlertCircle className="w-4 h-4" /> },
        { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500', icon: <Clock className="w-4 h-4" /> },
        { value: 'Completed', label: 'Completed', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> }
    ];

    return (
        <div className="min-h-screen w-screen bg-gray-50">

            {/* Edit Task Modal - Blurred Background */}
            {editingTask && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                                <p className="text-gray-500 text-sm mt-1">Update task details</p>
                            </div>
                            <button
                                onClick={() => setEditingTask(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Task Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                                        placeholder="Enter task title"
                                    />
                                </div>

                                {/* Due Date - Optional */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date (Optional)
                                        <span className="text-gray-500 text-xs ml-1">- Clear to remove due date</span>
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="date"
                                            value={editingTask.dueDate || ''}
                                            onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                                        />
                                        {editingTask.dueDate && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingTask({...editingTask, dueDate: ''})}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-sm"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Status
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setEditingTask({...editingTask, status: option.value})}
                                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                                    editingTask.status === option.value
                                                        ? `${option.color} border-transparent text-white`
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-full ${editingTask.status === option.value ? 'bg-white/20' : option.color} mb-2`}>
                                                    {option.icon}
                                                </div>
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateTask(editingTask._id, {
                                    title: editingTask.title,
                                    status: editingTask.status,
                                    dueDate: editingTask.dueDate
                                })}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - Blurred Background */}
            {taskToDelete && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Delete Task
                            </h3>
                            <p className="text-gray-500 text-center mb-6">
                                Are you sure you want to delete this task? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-center space-x-3">
                                <button
                                    onClick={() => setTaskToDelete(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteTask(taskToDelete)}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors shadow-sm"
                                >
                                    Delete Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">Taskly</h1>
                            <p className="text-gray-500 text-xs">Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Notification Bell */}
                        <button className="relative p-1.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors shadow-sm">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
                        </button>

                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-medium text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={logout}
                            className="flex items-center space-x-1.5 px-3 py-1.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors text-xs shadow-sm"
                        >
                            <LogOut className="w-3 h-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Welcome back, <span className="text-blue-600">{user?.name}!</span>
                    </h2>
                    <p className="text-gray-600 text-sm">Here's your task overview for today.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Total Tasks</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{total}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <List className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Completed</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{completed}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium">In Progress</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{inProgress}</p>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Completion</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{percentage}%</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <div className="w-5 h-5 text-purple-600 font-bold text-sm">%</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-56 text-gray-900 placeholder-gray-500 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    {/* All Status button */}
                                    <button
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className="flex items-center space-x-1.5 px-3 py-2 text-white 
                                                    bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700
                                                    rounded-lg text-sm shadow-sm"
                                    >
                                        <Filter className="w-4 h-4 text-white" />
                                        <span>
                                            {filterStatus === 'All' ? 'All Status' : filterStatus}
                                        </span>
                                        <ChevronDown className="w-3 h-3 text-white" />
                                    </button>

                                    {showFilterDropdown && (
                                        <div className="absolute top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStatus(status);
                                                        setShowFilterDropdown(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-sm
                                                        ${filterStatus === status 
                                                            ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700' 
                                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span>{status === 'All' ? 'All Status' : status}</span>
                                                    {filterStatus === status && (
                                                        <CheckCircle className="w-3 h-3 text-purple-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* View buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm shadow-sm
                                        ${view === 'list'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    <span>List</span>
                                </button>
                                <button
                                    onClick={() => setView('calendar')}
                                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm shadow-sm
                                        ${view === 'calendar'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Calendar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add Task Form - Updated with Optional Due Date */}
                    <form onSubmit={addTask} className="p-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="What needs to be done?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 text-sm"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                    disabled={isAddingTask}
                                />
                            </div>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-900 w-full md:w-40 appearance-auto pr-10"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        disabled={isAddingTask}
                                    />
                                    {newTask.dueDate && (
                                        <button
                                            type="button"
                                            onClick={() => setNewTask({...newTask, dueDate: ''})}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-900 w-full md:w-auto"
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                    disabled={isAddingTask}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={isAddingTask}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-1.5 text-sm shadow-sm w-full md:w-auto justify-center"
                                >
                                    {isAddingTask ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            <span>Add Task</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Due date is optional. Leave empty if no due date needed.
                        </div>
                    </form>

                    {/* Conditional Rendering for List vs Calendar View */}
                    {view === 'list' ? (
                        <div className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Your Tasks ({filteredTasks.length})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Showing {filterStatus === 'All' ? 'all' : filterStatus.toLowerCase()} tasks
                                </p>
                            </div>

                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                        <List className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h4 className="text-gray-900 font-medium text-sm mb-1">No tasks found</h4>
                                    <p className="text-gray-500 text-xs">
                                        {searchTerm ? 'Try a different search term' : 'Get started by adding your first task'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 hover:border-blue-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    {/* Task checkbox */}
                                                    <button
                                                        onClick={() => updateTaskStatus(
                                                            task._id,
                                                            task.status === 'Completed' ? 'Pending' : 'Completed'
                                                        )}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${task.status === 'Completed'
                                                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 border-teal-600'
                                                                : 'border-gray-300 hover:border-teal-500'
                                                            }`}
                                                    >
                                                        {task.status === 'Completed' && (
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        )}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-gray-900 text-sm truncate ${task.status === 'Completed' ? 'line-through text-gray-500' : ''
                                                            }`}>
                                                            {task.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                                {getStatusIcon(task.status)}
                                                                <span>{task.status}</span>
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="text-xs text-gray-500 flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveTaskMenu(activeTaskMenu === task._id ? null : task._id)}
                                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeTaskMenu === task._id && (
                                                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                            {/* Edit Task button */}
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingTask(task);
                                                                    setActiveTaskMenu(null);
                                                                }}
                                                                className="w-full px-3 py-2 text-left flex items-center space-x-1.5 text-sm bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                                <span>Edit Task</span>
                                                            </button>
                                                            
                                                            {/* Delete Task button */}
                                                            <button 
                                                                onClick={() => {
                                                                    setTaskToDelete(task._id);
                                                                    setActiveTaskMenu(null);
                                                                }}
                                                                className="w-full px-3 py-2 text-left flex items-center space-x-1.5 text-sm
                                                                    bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 hover:from-rose-100 hover:to-rose-200"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                <span>Delete Task</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            <CalendarView tasks={tasks.filter(t => t.dueDate)} />
                            {tasks.filter(t => !t.dueDate).length > 0 && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                                        <p className="text-sm text-amber-700">
                                            {tasks.filter(t => !t.dueDate).length} tasks without due dates are not shown on the calendar.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Stats Footer */}
                <div className="mt-4 text-center text-gray-500 text-xs">
                    <p>You have {pending} pending tasks and {completed} completed tasks.</p>
                    {tasks.filter(t => t.dueDate).length > 0 && (
                        <p className="mt-1">{tasks.filter(t => t.dueDate).length} tasks have due dates.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;