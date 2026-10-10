// User Dashboard JS

document.addEventListener('DOMContentLoaded', () => {
    initUserDashboard();
});

async function initUserDashboard() {
    const userProfileName = document.getElementById('userProfileName');
    if (!userProfileName) return; // Not on user dashboard page

    try {
        // Fetch session user info
        const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        const meData = await meRes.json();

        if (!meData.success || !meData.user) {
            window.location.href = 'login.html';
            return;
        }

        const user = meData.user;
        document.getElementById('userProfileName').textContent = user.name;
        document.getElementById('userProfileEmail').textContent = user.email;
        document.getElementById('userAvatarLetter').textContent = user.name.charAt(0).toUpperCase();

        // Fetch User's Orders
        fetchUserOrders();
    } catch (error) {
        console.error('User dashboard error:', error);
    }
}

async function fetchUserOrders() {
    const ordersTableBody = document.getElementById('userOrdersTableBody');
    if (!ordersTableBody) return;

    try {
        ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading your orders...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, { credentials: 'include' });
        const data = await response.json();

        if (!data.success) {
            ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Failed to load orders.</td></tr>`;
            return;
        }

        const orders = data.orders;
        document.getElementById('totalOrdersCount').textContent = orders.length;

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
                        You have not placed any orders yet. <a href="books.html" style="font-weight:600;">Browse Books</a>
                    </td>
                </tr>
            `;
            return;
        }

        ordersTableBody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#ORD-${order.id}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <img src="${escapeHtml(order.cover_image)}" style="width:36px; height:48px; object-fit:cover; border-radius:4px;" alt="">
                        <div>
                            <div style="font-weight:600;">${escapeHtml(order.book_title)}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(order.book_author)}</div>
                        </div>
                    </div>
                </td>
                <td>${order.quantity}</td>
                <td style="font-weight:700; color:var(--primary);">$${parseFloat(order.total_price).toFixed(2)}</td>
                <td>${formatBadge(order.status)}</td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
}

function formatBadge(status) {
    let badgeClass = 'badge-info';
    if (status === 'Completed') badgeClass = 'badge-success';
    if (status === 'Processing') badgeClass = 'badge-warning';
    if (status === 'Cancelled') badgeClass = 'badge-danger';

    return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
}
