// Global Base API URL Resolution
// When served by Express at http://localhost:3000, relative URLs ('') are used.
// If opened directly via file://, falls back to http://localhost:3000.
const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

document.addEventListener('DOMContentLoaded', () => {
    checkProtocolBanner();
    initNavigation();
    checkCurrentUser();
});

// Detect if opened via file:/// protocol and display helpful guidance
function checkProtocolBanner() {
    if (window.location.protocol === 'file:') {
        const existingBanner = document.getElementById('protocolNoticeBanner');
        if (existingBanner) return;

        const banner = document.createElement('div');
        banner.id = 'protocolNoticeBanner';
        banner.style.cssText = 'background: #fef2f2; border-bottom: 2px solid #ef4444; color: #991b1b; padding: 12px 20px; text-align: center; font-size: 14px; font-weight: 500; position: sticky; top: 0; z-index: 99999; box-shadow: 0 2px 8px rgba(0,0,0,0.08);';
        banner.innerHTML = '⚠️ <strong>Notice:</strong> You are viewing this page via the <code>file:///</code> protocol. To enable full authentication, session cookies, and database operations, please open the website through the Express server at <a href="http://localhost:3000" style="color: #b91c1c; text-decoration: underline; font-weight: 700; margin-left: 6px;">http://localhost:3000</a>.';
        document.body.prepend(banner);
    }
}

// Mobile Navigation Toggle
function initNavigation() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '✕' 
                : '☰';
        });
    }
}

// Check logged in user status and update Header Nav accordingly
async function checkCurrentUser() {
    const navActions = document.getElementById('navActions');
    const adminLinkContainer = document.getElementById('adminLinkContainer');

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.user) {
            const user = data.user;
            
            // Show Admin Dashboard link if user is Admin
            if (adminLinkContainer) {
                if (user.role === 'admin') {
                    adminLinkContainer.innerHTML = `<a href="admin-dashboard.html" class="nav-link">Admin Panel</a>`;
                } else {
                    adminLinkContainer.innerHTML = '';
                }
            }

            if (navActions) {
                navActions.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <a href="user-dashboard.html" class="btn btn-outline btn-sm">
                            👤 ${escapeHtml(user.name)}
                        </a>
                        <button id="logoutBtn" class="btn btn-secondary btn-sm">Logout</button>
                    </div>
                `;

                document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            }
        } else {
            if (adminLinkContainer) adminLinkContainer.innerHTML = '';
            if (navActions) {
                navActions.innerHTML = `
                    <a href="login.html" class="btn btn-outline btn-sm">Login</a>
                    <a href="register.html" class="btn btn-primary btn-sm">Register</a>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to verify user session:', error);
    }
}

// Global Logout Handler
async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility: Render Alert Banner
function showAlert(containerId, message, type = 'danger') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}">
            <span>${type === 'danger' ? '⚠️' : '✅'}</span>
            <div>${escapeHtml(message)}</div>
        </div>
    `;

    setTimeout(() => {
        if (container.innerHTML.includes(message)) {
            container.innerHTML = '';
        }
    }, 5000);
}

// Utility: HTML Escaping
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
