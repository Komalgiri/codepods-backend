
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheck, HiOutlineInformationCircle, HiOutlineUserGroup, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { notificationService, type Notification } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        const token = localStorage.getItem('token');
        if (token) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) CodePodAI`;
        } else {
            document.title = 'CodePodAI';
        }
    }, [unreadCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await handleMarkAsRead(notification.id, { stopPropagation: () => { } } as any);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'invite': return <HiOutlineUserGroup className="w-5 h-5 text-primary" />;
            case 'request': return <HiOutlineUserGroup className="w-5 h-5 text-blue-400" />;
            case 'success': return <HiOutlineCheck className="w-5 h-5 text-green-400" />;
            case 'warning': return <HiOutlineExclamationTriangle className="w-5 h-5 text-yellow-400" />;
            default: return <HiOutlineInformationCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            >
                <HiOutlineBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white ring-2 ring-[#0D1117] animate-in zoom-in duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-text-primary">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary">
                                    <HiOutlineBell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer relative ${!notification.read ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`text-sm ${!notification.read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-text-secondary opacity-50 mt-2 block">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                        className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0 hover:scale-150 transition-transform"
                                                        title="Mark as read"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
