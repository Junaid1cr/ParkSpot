
const axios = require('axios');

class MapServices {
    constructor() {
        this.orsApiKey = process.env.ORS_API_KEY; 
        this.orsBaseUrl = 'https://api.openrouteservice.org/v2';
    }

    async getRoute(start, end) {
        try {
            const response = await axios.get(`${this.orsBaseUrl}/directions/driving-car`, {
                params: {
                    start: `${start.lng},${start.lat}`,
                    end: `${end.lng},${end.lat}`
                },
                headers: {
                    'Authorization': this.orsApiKey
                }
            });

            return {
                route: response.data.features[0],
                distance: response.data.features[0].properties.segments[0].distance,
                duration: response.data.features[0].properties.segments[0].duration
            };
        } catch (error) {
            throw new Error('Error getting route: ' + error.message);
        }
    }

    async getDistance(start, destinations) {
        try {
            const response = await axios.post(`${this.orsBaseUrl}/matrix/driving-car`, {
                locations: [[start.lng, start.lat], ...destinations.map(d => [d.lng, d.lat])],
                metrics: ['distance', 'duration'],
                units: 'km'
            }, {
                headers: {
                    'Authorization': this.orsApiKey
                }
            });

            return response.data.distances[0].map((distance, index) => ({
                distance,
                duration: response.data.durations[0][index]
            }));
        } catch (error) {
            throw new Error('Error calculating distance: ' + error.message);
        }
    }
}

module.exports = new MapServices();