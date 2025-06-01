import React, { useState, useEffect } from 'react';
import { getStatsHistory, exportStatsHistory, importStatsHistory } from '../lib/statsHistory';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Download, Upload, Calendar, Clock, Activity, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const DashboardView = () => {
    const [statsHistory, setStatsHistory] = useState([]);
    const [timeRange, setTimeRange] = useState(7); // Default to 7 days
    const [chartType, setChartType] = useState('bar'); // 'bar', 'line', or 'area'

    useEffect(() => {
        // Load stats history when component mounts or timeRange changes
        const history = getStatsHistory(timeRange);

        // Reverse array so dates appear in chronological order (oldest to newest)
        setStatsHistory([...history].reverse());
    }, [timeRange]);

    const handleExport = () => {
        // Create a blob with the stats history data
        const jsonData = exportStatsHistory();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `annoying-pomodoro-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const jsonData = event.target.result;
                if (importStatsHistory(jsonData)) {
                    // Refresh data after successful import
                    const history = getStatsHistory(timeRange);
                    setStatsHistory([...history].reverse());
                } else {
                    alert('Failed to import stats. Invalid format.');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    };

    // Format data for better display
    const formatMinutes = (totalSeconds) => {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "0m";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Custom tooltip component for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                    <p className="font-bold">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatMinutes(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // No data state
    if (statsHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <CardTitle>Productivity Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                            <Activity className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-lg text-center mb-4">No historical data available yet</p>
                            <p className="text-sm text-center text-gray-500 mb-6">
                                Complete tasks to start building your productivity history
                            </p>
                            <div className="flex space-x-4">
                                <Button onClick={handleImport} className="flex items-center">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Data
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card className="mb-4">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Productivity Dashboard</CardTitle>

                    <div className="flex items-center space-x-2 flex-wrap justify-center">
                        <Select onValueChange={(value) => setTimeRange(parseInt(value, 10))} value={timeRange.toString()}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="14">14 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-2 flex-wrap justify-center">
                            <Select onValueChange={(value) => setChartType(value)} value={chartType}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Select Chart" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="line">Line</SelectItem>
                                    <SelectItem value="area">Area</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex space-x-2 flex-wrap justify-center">
                            <Button onClick={handleExport} size="sm" variant="outline" className="flex items-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button onClick={handleImport} size="sm" variant="outline" className="flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Import
                            </Button>
                        </div>
                    </div>

                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' && (
                                <BarChart data={statsHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatMinutes(value)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="focusTime" name="Focus Time" fill="#4f46e5" />
                                    <Bar dataKey="idleTime" name="Idle Time" fill="#f97316" />
                                </BarChart>
                            )}

                            {chartType === 'line' && (
                                <LineChart data={statsHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatMinutes(value)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="focusTime" name="Focus Time" stroke="#4f46e5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="idleTime" name="Idle Time" stroke="#f97316" strokeWidth={2} />
                                </LineChart>
                            )}

                            {chartType === 'area' && (
                                <AreaChart data={statsHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatMinutes(value)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area type="monotone" dataKey="focusTime" name="Focus Time" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="idleTime" name="Idle Time" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Stats summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Calendar className="h-10 w-10 text-blue-500 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Days Tracked</p>
                                <h3 className="text-2xl font-bold">{statsHistory.length}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Clock className="h-10 w-10 text-indigo-500 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Focus Time</p>
                                <h3 className="text-2xl font-bold">
                                    {formatMinutes(statsHistory.reduce((acc, day) => acc + (day.focusTime || 0), 0))}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-10 w-10 text-green-500 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Score</p>
                                <h3 className="text-2xl font-bold">
                                    {statsHistory.reduce((acc, day) => acc + (day.score || 0), 0).toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed stats table */}
            <Card className="shadow-md">
                <CardHeader className="py-3 border-b border-dark-300/25">
                    <CardTitle className="text-lg font-semibold text-lightText">Detailed Stats</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-3.5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dark-300/40">
                                    <th className="py-2 px-4 text-left text-gray-400 font-medium">Date</th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-medium">Focus Time</th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-medium">Idle Time</th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-medium">Tasks Completed</th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-medium">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statsHistory.map((day, index) => (
                                    <tr key={index} className={`border-b border-dark-300/20 ${index % 2 === 0 ? "bg-neutral-800" : "bg-neutral-900"}`}>
                                        <td className="py-2 px-4 text-lightText">{day.date}</td>
                                        <td className="py-2 px-4 text-lightText font-semibold">{formatMinutes(day.focusTime || 0)}</td>
                                        <td className="py-2 px-4 text-lightText font-semibold">{formatMinutes(day.idleTime || 0)}</td>
                                        <td className="py-2 px-4 text-lightText font-semibold">{day.tasksCompleted || 0}</td>
                                        <td className="py-2 px-4 text-lightText font-semibold">{day.score || 0}</td>
                                    </tr>
                                ))}
                                {statsHistory.length === 0 && (
                                    <tr className="bg-neutral-800">
                                        <td colSpan="5" className="py-10 px-4 text-center text-gray-500">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardView; 