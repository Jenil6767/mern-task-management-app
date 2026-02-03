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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Organization Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={projectStats.totalTasks} color="blue" />
                <StatCard title="Completed" value={projectStats.completedTasks} color="green" />
                <StatCard title="Pending" value={projectStats.pendingTasks} color="yellow" />
                <StatCard title="Overdue" value={projectStats.overdueTasks} color="red" />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">User Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 font-semibold text-gray-600">User</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Completed</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Pending</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Overdue</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Avg. Time (Hours)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userStats.map((user) => (
                                <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 text-gray-800 font-medium">{user.userName}</td>
                                    <td className="py-3 px-4 text-green-600">{user.completedTasks}</td>
                                    <td className="py-3 px-4 text-yellow-600">{user.pendingTasks}</td>
                                    <td className="py-3 px-4 text-red-600">{user.overdueTasks}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {user.avgCompletionTimeHours ? parseFloat(user.avgCompletionTimeHours).toFixed(1) : 'N/A'}
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
    const colors = {
        blue: 'border-blue-500 text-blue-600',
        green: 'border-green-500 text-green-600',
        yellow: 'border-yellow-500 text-yellow-600',
        red: 'border-red-500 text-red-600',
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${colors[color]}`}>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
    );
};

export default Analytics;
