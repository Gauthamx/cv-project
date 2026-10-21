const getApiBaseUrl = () => {
    // If opened via file:// protocol directly in browser
    if (window.location.protocol === 'file:') {
        return 'http://localhost:5000/api';
    }
    // If running on a frontend dev server (e.g. Live Server on port 5500, Vite, or 3000)
    if (window.location.port && window.location.port !== '5000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://${window.location.hostname}:5000/api`;
    }
    // Standard relative URL when served by Express or LAN access
    return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const API = {
    async getLibraryStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/library`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch library status`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching library status:', error);
            throw error;
        }
    },
    
    async getLibrarySeats() {
        try {
            const response = await fetch(`${API_BASE_URL}/library/seats`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch library seats`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching library seats:', error);
            throw error;
        }
    },

    async getParkingStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/parking`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch parking status`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching parking status:', error);
            throw error;
        }
    },

    async getParkingSlots() {
        try {
            const response = await fetch(`${API_BASE_URL}/parking/slots`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch parking slots`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching parking slots:', error);
            throw error;
        }
    },
    
    async getSystemStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/status`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch system status`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching system status:', error);
            throw error;
        }
    },

    async getOccupancyHistory(facility, limit = 20) {
        try {
            const url = facility 
                ? `${API_BASE_URL}/occupancy?facility=${facility}&limit=${limit}`
                : `${API_BASE_URL}/occupancy?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch occupancy history`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching occupancy history:', error);
            throw error;
        }
    }
};
