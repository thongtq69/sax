'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import {
    TrendingUp, Users, Eye, MousePointer2, Smartphone, Monitor, Tablet,
    ArrowLeft, Calendar, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
    activeUsers: number
    devices: { category: string; users: number }[]
    historicalStats: { date: string; views: number; sessions: number; users: number }[]
    topPages: { title: string; path: string; views: number }[]
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/analytics')
                if (response.ok) {
                    const result = await response.json()
                    setData(result)
                }
            } catch (error) {
                console.error('Error fetching analytics:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [refreshKey])

    // Format date for display (e.g., 20240306 -> Mar 6)
    const formatChartDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = parseInt(dateStr.substring(4, 6)) - 1
        const day = parseInt(dateStr.substring(6, 8))
        return `${monthNames[month]} ${day}`
    }

    const chartData = data?.historicalStats.map(item => ({
        ...item,
        name: formatChartDate(item.date)
    })) || []

    const deviceData = data?.devices.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.users
    })) || []

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/admin" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Site Analytics</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Detailed performance reports from Google Analytics 4</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-medium text-emerald-700">{data?.activeUsers || 0} active now</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Total Views<br />(Last 7 Days)</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data?.historicalStats.reduce((acc, curr) => acc + curr.views, 0).toLocaleString() || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-50 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Unique Users<br />(Last 7 Days)</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data?.historicalStats.reduce((acc, curr) => acc + curr.users, 0).toLocaleString() || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Avg. Daily Views</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {Math.round((data?.historicalStats.reduce((acc, curr) => acc + curr.views, 0) || 0) / 7).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Traffic Trends
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c5141b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#c5141b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#c5141b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    name="Page Views"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Devices
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        {deviceData.map((device, index) => (
                            <div key={device.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm text-gray-600">{device.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{device.value} guests</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Pages Table */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <MousePointer2 className="h-5 w-5 text-primary" />
                    Most Visited Pages
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Page</th>
                                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.topPages.map((page, index) => (
                                <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{page.title}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{page.path}</p>
                                    </td>
                                    <td className="py-4 text-right">
                                        <span className="text-sm font-bold text-gray-900">{page.views.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                            {(!data?.topPages || data.topPages.length === 0) && (
                                <tr>
                                    <td colSpan={2} className="py-8 text-center text-gray-500 italic">No page data available yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
