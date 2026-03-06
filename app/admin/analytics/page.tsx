'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts'
import {
    TrendingUp, Users, Eye, MousePointer2, Smartphone, Monitor, Tablet,
    ArrowLeft, Calendar, RefreshCw, Globe, Share2, Compass, Clock, Activity, LogOut
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
    activeUsers: number
    devices: { category: string; users: number }[]
    historicalStats: { date: string; views: number; sessions: number; users: number }[]
    topPages: { title: string; path: string; views: number }[]
    sources: { source: string; users: number }[]
    geo: { country: string; users: number }[]
    engagement: {
        avgSessionDuration: number;
        bounceRate: number;
        sessionsPerUser: number;
        engagementRate: number
    } | null
    browsers: { browser: string; users: number }[]
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [days, setDays] = useState(7)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/admin/analytics?days=${days}`)
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
    }, [days, refreshKey])

    const formatChartDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = parseInt(dateStr.substring(4, 6)) - 1
        const day = parseInt(dateStr.substring(6, 8))
        return `${monthNames[month]} ${day}`
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.round(seconds % 60)
        return `${mins}m ${secs}s`
    }

    const chartData = data?.historicalStats.map(item => ({
        ...item,
        name: formatChartDate(item.date)
    })) || []

    const deviceData = data?.devices.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.users
    })) || []

    const sourceData = data?.sources.map(item => ({
        name: item.source,
        value: item.users
    })) || []

    const COLORS = ['#c5141b', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

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
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/admin" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Detailed Analytics</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Comprehensive performance reports for {days} days</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setDays(7)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${days === 7 ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setDays(30)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${days === 30 ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setDays(90)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${days === 90 ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            90 Days
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <div className="relative">
                            <Users className="h-4 w-4 text-emerald-600" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{data?.activeUsers || 0} online</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-10"
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin mr-2' : ''}`} />
                        {!isLoading && <span className="ml-2 font-medium">Sync Data</span>}
                    </Button>
                </div>
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
                        <Eye className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Total Page Views</p>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {data?.historicalStats.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Total volume for {days} days</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
                        <Users className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">Total Visitors</p>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {data?.historicalStats.reduce((acc, curr) => acc + curr.users, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Unique individuals reach</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Avg. Stay Time</p>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {data?.engagement ? formatDuration(data.engagement.avgSessionDuration) : '0s'}
                    </p>
                    <p className="text-xs text-gray-400">Session engagement quality</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Engagement Rate</p>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {data?.engagement ? data.engagement.engagementRate.toFixed(1) : '0'}%
                    </p>
                    <p className="text-xs text-gray-400">Quality session / Total sessions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Chart */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Traffic Intensity
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span>Views</div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>Users</div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c5141b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#c5141b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'black', color: '#111827', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#c5141b" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" name="Page Views" />
                                <Area type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" name="Unique Users" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Compass className="h-5 w-5 text-primary" />
                        Acquisition Channels
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                        {sourceData.map((source, index) => (
                            <div key={source.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{source.name}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{source.value} users</span>
                            </div>
                        ))}
                        {sourceData.length === 0 && <p className="text-center text-gray-400 text-sm italic py-4">Wait for data...</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geography Table */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Top Locations
                    </h3>
                    <div className="space-y-4">
                        {data?.geo.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-900">{item.country}</span>
                                    <span className="text-gray-500 font-bold">{item.users} users</span>
                                </div>
                                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full opacity-80"
                                        style={{ width: `${(item.users / data.geo[0].users) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!data?.geo || data.geo.length === 0) && <p className="text-center text-gray-400 py-8">No geo data</p>}
                    </div>
                </div>

                {/* Browser Stats */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        Technology & Platforms
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Browsers</p>
                            {data?.browsers.map((b, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-600 truncate mr-2">{b.browser}</span>
                                    <span className="text-sm font-black text-gray-900 min-w-fit">{b.users}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Device Category</p>
                            <div className="space-y-4">
                                {deviceData.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {d.name === 'Mobile' ? <Smartphone className="h-4 w-4 text-primary" /> : d.name === 'Desktop' ? <Monitor className="h-4 w-4 text-primary" /> : <Tablet className="h-4 w-4 text-primary" />}
                                            <span className="text-sm font-semibold text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pages Impact Table */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Content Popularity & Impact
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Page Directory / Title</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Reach (Views)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.topPages.map((page, index) => (
                                <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-5 pr-4">
                                        <p className="text-sm font-black text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{page.title}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-1 opacity-60">{page.path}</p>
                                    </td>
                                    <td className="py-5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-lg font-black text-gray-900">{page.views.toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!data?.topPages || data.topPages.length === 0) && (
                                <tr>
                                    <td colSpan={2} className="py-12 text-center text-gray-400 italic">Exploring data...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
