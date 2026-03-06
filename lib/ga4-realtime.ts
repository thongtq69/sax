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
