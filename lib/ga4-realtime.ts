import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Google Analytics 4 Real-time Data Service
 */

// Initialize the client with service account credentials
const propertyId = process.env.GA4_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({
    credentials: {
        client_email: process.env.GA4_CLIENT_EMAIL,
        private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export async function getRealtimeActiveUsers() {
    if (!propertyId) {
        console.warn('GA4_PROPERTY_ID is not defined');
        return 0;
    }

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [
                {
                    name: 'activeUsers',
                },
            ],
        });

        // The result is in rows[0].metricValues[0].value
        const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        return activeUsers;
    } catch (error) {
        console.error('Error fetching GA4 real-time data:', error);
        return 0;
    }
}

export async function getRealtimeDevices() {
    if (!propertyId) return [];

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            dimensions: [
                {
                    name: 'deviceCategory',
                },
            ],
            metrics: [
                {
                    name: 'activeUsers',
                },
            ],
        });

        return (response.rows || []).map(row => ({
            category: row.dimensionValues?.[0]?.value || 'unknown',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 device data:', error);
        return [];
    }
}

export async function getHistoricalStats(days = 7) {
    if (!propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'date' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'sessions' },
                { name: 'totalUsers' }
            ],
            orderBys: [{ dimension: { dimensionName: 'date' } }]
        });

        return (response.rows || []).map((row: any) => ({
            date: row.dimensionValues?.[0]?.value || '',
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
            users: parseInt(row.metricValues?.[2]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 historical data:', error);
        return [];
    }
}

export async function getTopPages(days = 7) {
    if (!propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            limit: 10,
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
        });

        return (response.rows || []).map((row: any) => ({
            title: row.dimensionValues?.[0]?.value || 'Untitled',
            path: row.dimensionValues?.[1]?.value || '',
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 top pages:', error);
        return [];
    }
}

export async function getTrafficSources(days = 7) {
    if (!propertyId) return [];
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'totalUsers' }],
            orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
        });
        return (response.rows || []).map((row: any) => ({
            source: row.dimensionValues?.[0]?.value || 'Direct',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 source data:', error);
        return [];
    }
}

export async function getGeoStats(days = 7) {
    if (!propertyId) return [];
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'totalUsers' }],
            limit: 10,
            orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
        });
        return (response.rows || []).map((row: any) => ({
            country: row.dimensionValues?.[0]?.value || 'Unknown',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 geo data:', error);
        return [];
    }
}

export async function getEngagementMetrics(days = 7) {
    if (!propertyId) return null;
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            metrics: [
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
                { name: 'sessionsPerUser' },
                { name: 'engagementRate' }
            ]
        });
        const values = response.rows?.[0]?.metricValues || [];
        return {
            avgSessionDuration: parseFloat(values[0]?.value || '0'),
            bounceRate: parseFloat(values[1]?.value || '0') * 100,
            sessionsPerUser: parseFloat(values[2]?.value || '0'),
            engagementRate: parseFloat(values[3]?.value || '0') * 100,
        };
    } catch (error) {
        console.error('Error fetching GA4 engagement data:', error);
        return null;
    }
}

export async function getBrowserStats(days = 7) {
    if (!propertyId) return [];
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'browser' }],
            metrics: [{ name: 'totalUsers' }],
            limit: 5,
            orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
        });
        return (response.rows || []).map((row: any) => ({
            browser: row.dimensionValues?.[0]?.value || 'Other',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));
    } catch (error) {
        console.error('Error fetching GA4 browser data:', error);
        return [];
    }
}



