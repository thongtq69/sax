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

export async function getHistoricalStats() {
    if (!propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
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

export async function getTopPages() {
    if (!propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
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


