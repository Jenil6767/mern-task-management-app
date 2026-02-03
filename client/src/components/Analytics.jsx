import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from './common/Spinner';
import ErrorMessage from './common/ErrorMessage';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics');
            setData(response.data);
        } catch (err) {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
    if (error) return <ErrorMessage message={error} />;
    if (!data) return null;

    const { projectStats, userStats } = data;

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Organization <span className="gradient-text">Analytics</span>
                </h1>
                <p className="text-gray-500 font-medium mt-1">Real-time performance metrics and task distribution.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Tasks" value={projectStats.totalTasks} color="blue" />
                <StatCard title="Completed" value={projectStats.completedTasks} color="green" />
                <StatCard title="Pending" value={projectStats.pendingTasks} color="yellow" />
                <StatCard title="Overdue" value={projectStats.overdueTasks} color="red" />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <h2 className="text-xl font-bold text-gray-800">User Performance</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Members</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-[11px] tracking-widest">User</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-[11px] tracking-widest">Completed</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-[11px] tracking-widest">Pending</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-[11px] tracking-widest">Overdue</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-[11px] tracking-widest text-right">Avg. Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 uppercase text-[11px] tracking-widest font-bold">
                            {userStats.map((user) => (
                                <tr key={user.userId} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-sm">
                                                {user.userName.charAt(0)}
                                            </div>
                                            <span className="text-gray-900 text-sm font-bold tracking-tight normal-case">{user.userName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6"><span className="text-emerald-600 font-bold text-sm">{user.completedTasks}</span></td>
                                    <td className="py-4 px-6"><span className="text-yellow-600 font-bold text-sm">{user.pendingTasks}</span></td>
                                    <td className="py-4 px-6"><span className="text-red-500 font-bold text-sm">{user.overdueTasks}</span></td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                            {user.avgCompletionTimeHours ? parseFloat(user.avgCompletionTimeHours).toFixed(1) : '0'} hrs
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const configs = {
        blue: { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50/50', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        green: { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        yellow: { border: 'border-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50/50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        red: { border: 'border-red-500', text: 'text-red-600', bg: 'bg-red-50/50', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    };

    const config = configs[color];

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group`}>
            {/* Background Icon Watermark */}
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d={config.icon} /></svg>
            </div>

            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${config.bg} ${config.text}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={config.icon} />
                    </svg>
                </div>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <p className="text-4xl font-extrabold mt-1 text-gray-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
};

export default Analytics;
