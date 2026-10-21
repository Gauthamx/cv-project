document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            if (navActions) navActions.classList.toggle('nav-active');
        });
    }

    // Generate QR Code if container exists
    initQrCode();

    // Load initial high-level stats for hero section
    if (document.getElementById('hero-lib-avail')) {
        loadHeroStats();
        // Update stats every 10 seconds on the homepage
        setInterval(loadHeroStats, 10000);
    }
});

async function initQrCode() {
    const qrcodeContainer = document.getElementById('qrcode');
    if (!qrcodeContainer) return;

    let targetUrl = `${window.location.origin}/dashboard.html`;

    try {
        const sysStatus = await API.getSystemStatus();
        if (sysStatus && sysStatus.networkUrl && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            targetUrl = `${sysStatus.networkUrl}/dashboard.html`;
        }
    } catch (err) {
        // Fallback to current browser URL
        let baseUrl = window.location.href.split('?')[0].split('#')[0];
        if (baseUrl.endsWith('index.html')) {
            baseUrl = baseUrl.replace('index.html', '');
        } else if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        targetUrl = baseUrl + 'dashboard.html';
    }

    // Render QR Code if library is available
    if (typeof QRCode !== 'undefined') {
        qrcodeContainer.innerHTML = '';
        new QRCode(qrcodeContainer, {
            text: targetUrl,
            width: 180,
            height: 180,
            colorDark: "#0f111a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Add helpful label below QR code
        const label = document.createElement('div');
        label.style.marginTop = '12px';
        label.style.textAlign = 'center';
        label.style.fontSize = '0.78rem';
        label.style.color = '#4b5563';
        label.style.wordBreak = 'break-all';
        label.innerHTML = `Scan to open on mobile:<br><strong style="color: #4f46e5;">${targetUrl}</strong>`;
        qrcodeContainer.appendChild(label);
    } else {
        qrcodeContainer.innerHTML = `
            <div style="text-align:center; padding: 1rem; color: #6b7280;">
                <p>QR Code Library Offline</p>
                <p style="font-size:0.8rem; margin-top:0.5rem;">Access dashboard at:<br><code>${targetUrl}</code></p>
            </div>
        `;
    }
}

async function loadHeroStats() {
    try {
        const [libData, parkData] = await Promise.all([
            API.getLibraryStatus(),
            API.getParkingStatus()
        ]);

        // Update Library Stats
        if (document.getElementById('hero-lib-avail')) {
            document.getElementById('hero-lib-avail').textContent = libData.availableSeats !== undefined ? libData.availableSeats : '--';
            document.getElementById('hero-lib-occ').textContent = libData.occupiedSeats !== undefined ? libData.occupiedSeats : '--';
            document.getElementById('hero-lib-bar').style.width = `${libData.occupancyPercentage || 0}%`;
        }

        // Update Parking Stats
        if (document.getElementById('hero-park-avail')) {
            document.getElementById('hero-park-avail').textContent = parkData.availableSlots !== undefined ? parkData.availableSlots : '--';
            document.getElementById('hero-park-occ').textContent = parkData.occupiedSlots !== undefined ? parkData.occupiedSlots : '--';
            document.getElementById('hero-park-bar').style.width = `${parkData.occupancyPercentage || 0}%`;
        }
    } catch (error) {
        console.warn("[CampusVision] Hero stats update waiting for server:", error.message);
    }
}
