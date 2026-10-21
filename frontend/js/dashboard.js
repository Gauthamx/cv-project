let pollInterval;
const UPDATE_INTERVAL_MS = 4000; // 4 seconds polling

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
        });
    }

    // Initial Load
    initDashboard();
});

async function initDashboard() {
    await fetchAndUpdateDashboard();
    
    // Hide loading screen smoothly after first fetch
    const loadingElem = document.getElementById('loading');
    if (loadingElem) {
        loadingElem.style.opacity = '0';
        setTimeout(() => {
            loadingElem.style.display = 'none';
        }, 400);
    }

    // Start polling
    if (!pollInterval) {
        pollInterval = setInterval(fetchAndUpdateDashboard, UPDATE_INTERVAL_MS);
    }
}

function showError(msg) {
    const errContainer = document.getElementById('error-container');
    if (errContainer) {
        errContainer.textContent = msg;
        errContainer.style.display = 'block';
    }
}

function hideError() {
    const errContainer = document.getElementById('error-container');
    if (errContainer) {
        errContainer.style.display = 'none';
    }
}

function updateTimeAgo(isoString) {
    const timeElem = document.getElementById('last-updated-time');
    if (!timeElem) return;

    if (!isoString) {
        timeElem.textContent = 'Live';
        return;
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        timeElem.textContent = 'Live';
        return;
    }

    const now = new Date();
    const secondsAgo = Math.max(0, Math.floor((now - date) / 1000));
    
    if (secondsAgo < 5) {
        timeElem.textContent = 'Live (Just now)';
    } else if (secondsAgo < 60) {
        timeElem.textContent = `Updated ${secondsAgo}s ago`;
    } else {
        const mins = Math.floor(secondsAgo / 60);
        timeElem.textContent = `Updated ${mins}m ago`;
    }
}

async function fetchAndUpdateDashboard() {
    try {
        // Fetch System status to check demo mode and database mode
        try {
            const systemStatus = await API.getSystemStatus();
            const demoBadge = document.getElementById('demo-badge');
            if (demoBadge) {
                if (systemStatus && systemStatus.demoMode) {
                    demoBadge.style.display = 'inline-block';
                    demoBadge.textContent = systemStatus.database === 'in-memory' 
                        ? 'DEMO MODE (IN-MEMORY)' 
                        : 'DEMO MODE (SIMULATED)';
                } else {
                    demoBadge.style.display = 'none';
                }
            }
        } catch (e) {
            // Ignore system status fetch failure if API is briefly warming up
        }

        // Fetch facility status & layouts in parallel
        const [libData, parkData, libSeats, parkSlots] = await Promise.all([
            API.getLibraryStatus(),
            API.getParkingStatus(),
            API.getLibrarySeats(),
            API.getParkingSlots()
        ]);

        hideError();

        // Update Overview Cards
        updateLibraryOverview(libData);
        updateParkingOverview(parkData);

        // Update Layout Grids
        updateLibraryGrid(libSeats);
        updateParkingGrid(parkSlots);

        // Determine most recent update time safely without crashing on Invalid Date
        let latestDate = new Date();
        if (libData && libData.lastUpdated && !isNaN(new Date(libData.lastUpdated).getTime())) {
            latestDate = new Date(libData.lastUpdated);
        }
        if (parkData && parkData.lastUpdated && !isNaN(new Date(parkData.lastUpdated).getTime())) {
            const parkDate = new Date(parkData.lastUpdated);
            if (parkDate > latestDate) latestDate = parkDate;
        }
        
        updateTimeAgo(latestDate.toISOString());

    } catch (err) {
        console.warn('Dashboard fetch issue:', err);
        showError('Unable to connect to the CampusVision server. Automatically retrying...');
    }
}

function updateLibraryOverview(data) {
    if (!data) return;
    const availElem = document.getElementById('lib-avail');
    const occElem = document.getElementById('lib-occ');
    const totalElem = document.getElementById('lib-total');
    const barElem = document.getElementById('lib-bar');
    const percElem = document.getElementById('lib-perc');

    if (availElem) availElem.textContent = data.availableSeats !== undefined ? data.availableSeats : '--';
    if (occElem) occElem.textContent = data.occupiedSeats !== undefined ? data.occupiedSeats : '--';
    if (totalElem) totalElem.textContent = data.totalSeats !== undefined ? data.totalSeats : '--';
    if (barElem) barElem.style.width = `${data.occupancyPercentage || 0}%`;
    if (percElem) percElem.textContent = data.occupancyPercentage !== undefined ? data.occupancyPercentage : '0';
}

function updateParkingOverview(data) {
    if (!data) return;
    const availElem = document.getElementById('park-avail');
    const occElem = document.getElementById('park-occ');
    const totalElem = document.getElementById('park-total');
    const barElem = document.getElementById('park-bar');
    const percElem = document.getElementById('park-perc');

    if (availElem) availElem.textContent = data.availableSlots !== undefined ? data.availableSlots : '--';
    if (occElem) occElem.textContent = data.occupiedSlots !== undefined ? data.occupiedSlots : '--';
    if (totalElem) totalElem.textContent = data.totalSlots !== undefined ? data.totalSlots : '--';
    if (barElem) barElem.style.width = `${data.occupancyPercentage || 0}%`;
    if (percElem) percElem.textContent = data.occupancyPercentage !== undefined ? data.occupancyPercentage : '0';
}

function updateLibraryGrid(seats) {
    const grid = document.getElementById('library-grid');
    if (!grid || !Array.isArray(seats)) return;
    
    // Only re-render or update attributes
    grid.innerHTML = '';
    
    seats.forEach(seat => {
        const isOccupied = seat.status === 'occupied';
        const el = document.createElement('div');
        el.className = `grid-item ${isOccupied ? 'seat-occupied' : 'seat-available'}`;
        el.title = `Seat ${seat.seatId} - ${isOccupied ? 'Occupied' : 'Available'}`;
        el.innerHTML = `
            <span class="id">${seat.seatId}</span>
            <div class="indicator ${isOccupied ? 'occupied' : 'available'}"></div>
        `;
        grid.appendChild(el);
    });
}

function updateParkingGrid(slots) {
    const grid = document.getElementById('parking-grid');
    if (!grid || !Array.isArray(slots)) return;
    
    grid.innerHTML = '';
    
    slots.forEach(slot => {
        const isOccupied = slot.status === 'occupied';
        const el = document.createElement('div');
        el.className = `grid-item ${isOccupied ? 'slot-occupied' : 'slot-available'}`;
        el.title = `Slot ${slot.slotId} - ${isOccupied ? 'Occupied' : 'Available'}`;
        el.innerHTML = `
            <span class="id">${slot.slotId}</span>
            <div class="indicator ${isOccupied ? 'occupied' : 'available'}"></div>
        `;
        grid.appendChild(el);
    });
}
