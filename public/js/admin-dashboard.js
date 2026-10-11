// Admin Dashboard JS - Full CRUD Management

let adminBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
});

async function initAdminDashboard() {
    const adminContainer = document.getElementById('adminContainer');
    if (!adminContainer) return; // Not on admin page

    try {
        // Check Admin authentication
        const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        const meData = await meRes.json();

        if (!meData.success || !meData.user || meData.user.role !== 'admin') {
            alert('Admin privileges required. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('adminName').textContent = meData.user.name;

        // Load Admin Panels
        loadAdminStats();
        loadAdminBooks();
        loadAdminUsers();
        loadAdminMessages();
        loadAdminOrders();

        setupAdminTabNavigation();
        setupBookModal();
    } catch (error) {
        console.error('Admin initialization error:', error);
    }
}

// Tab navigation for admin section
function setupAdminTabNavigation() {
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.getAttribute('data-target');

            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');

            tab.classList.add('active');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.style.display = 'block';
        });
    });
}

// Stats counter loader
async function loadAdminStats() {
    try {
        const [booksRes, ordersRes, messagesRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/books`, { credentials: 'include' }),
            fetch(`${API_BASE_URL}/api/orders`, { credentials: 'include' }),
            fetch(`${API_BASE_URL}/api/contact`, { credentials: 'include' }),
            fetch(`${API_BASE_URL}/api/auth/users`, { credentials: 'include' })
        ]);

        const booksData = await booksRes.json();
        const ordersData = await ordersRes.json();
        const messagesData = await messagesRes.json();
        const usersData = await usersRes.json();

        if (booksData.success) document.getElementById('statTotalBooks').textContent = booksData.count;
        if (ordersData.success) document.getElementById('statTotalOrders').textContent = ordersData.count;
        if (messagesData.success) document.getElementById('statTotalMessages').textContent = messagesData.count;
        if (usersData.success) document.getElementById('statTotalUsers').textContent = usersData.count;
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// ---------------------------------------------------------
// BOOKS CRUD OPERATIONS
// ---------------------------------------------------------
async function loadAdminBooks() {
    const tbody = document.getElementById('adminBooksTableBody');
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading books catalog...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/api/books`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            adminBooks = data.books;
            renderAdminBooksTable(adminBooks);
        }
    } catch (error) {
        console.error('Error loading books for admin:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Failed to load books.</td></tr>`;
    }
}

function renderAdminBooksTable(books) {
    const tbody = document.getElementById('adminBooksTableBody');
    if (!tbody) return;

    if (books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No books in database. Click "Add New Book" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.id}</td>
            <td>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="${escapeHtml(b.cover_image)}" style="width:36px; height:48px; object-fit:cover; border-radius:4px;" alt="">
                    <span style="font-weight:600;">${escapeHtml(b.title)}</span>
                </div>
            </td>
            <td>${escapeHtml(b.author)}</td>
            <td><span class="badge badge-info">${escapeHtml(b.category)}</span></td>
            <td style="font-weight:700;">$${parseFloat(b.price).toFixed(2)}</td>
            <td>${b.stock}</td>
            <td>
                <div style="display:flex; gap:0.4rem;">
                    <button onclick="openEditBookModal(${b.id})" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="deleteBook(${b.id})" class="btn btn-danger btn-sm">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Add/Edit Book Modal setup
function setupBookModal() {
    const addBookBtn = document.getElementById('addBookBtn');
    const bookForm = document.getElementById('bookForm');

    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add New Book';
            document.getElementById('bookId').value = '';
            bookForm.reset();
            document.getElementById('bookModal').classList.add('active');
        });
    }

    if (bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('bookId').value;
            const title = document.getElementById('bookTitle').value.trim();
            const author = document.getElementById('bookAuthor').value.trim();
            const category = document.getElementById('bookCategory').value;
            const price = parseFloat(document.getElementById('bookPrice').value);
            const stock = parseInt(document.getElementById('bookStock').value);
            const cover_image = document.getElementById('bookCover').value.trim();
            const description = document.getElementById('bookDescription').value.trim();

            const payload = { title, author, category, price, stock, cover_image, description };

            try {
                let url = `${API_BASE_URL}/api/books`;
                let method = 'POST';

                if (id) {
                    url += `/${id}`;
                    method = 'PUT';
                }

                const response = await fetch(url, {
                    method,
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success) {
                    closeBookModal();
                    loadAdminBooks();
                    loadAdminStats();
                    alert(id ? 'Book updated successfully!' : 'Book added successfully!');
                } else {
                    alert(data.message || 'Operation failed.');
                }
            } catch (error) {
                console.error('Error saving book:', error);
            }
        });
    }
}

function openEditBookModal(bookId) {
    const book = adminBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('modalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookPrice').value = book.price;
    document.getElementById('bookStock').value = book.stock;
    document.getElementById('bookCover').value = book.cover_image;
    document.getElementById('bookDescription').value = book.description;

    document.getElementById('bookModal').classList.add('active');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: 'DELETE', credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            loadAdminBooks();
            loadAdminStats();
        } else {
            alert(data.message || 'Failed to delete book.');
        }
    } catch (error) {
        console.error('Delete book error:', error);
    }
}

// ---------------------------------------------------------
// USERS MANAGEMENT
// ---------------------------------------------------------
async function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading system users...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/api/auth/users`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            const users = data.users;
            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No users found in system.</td></tr>`;
                return;
            }

            tbody.innerHTML = users.map(u => `
                <tr>
                    <td>#${u.id}</td>
                    <td><strong>${escapeHtml(u.name)}</strong></td>
                    <td>${escapeHtml(u.email)}</td>
                    <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'}">${escapeHtml(u.role.toUpperCase())}</span></td>
                    <td style="font-size:0.85rem; color:var(--text-muted);">${new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                        ${u.role !== 'admin' ? `<button onclick="deleteAdminUser(${u.id})" class="btn btn-danger btn-sm">Delete</button>` : `<span style="font-size:0.8rem; color:var(--text-muted);">Protected</span>`}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Failed to load users list.</td></tr>`;
    }
}

async function deleteAdminUser(userId) {
    if (!confirm('Are you sure you want to delete this user account?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, { method: 'DELETE', credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            loadAdminUsers();
            loadAdminStats();
            alert('User deleted successfully.');
        } else {
            alert(data.message || 'Failed to delete user.');
        }
    } catch (error) {
        console.error('Delete user error:', error);
    }
}

// ---------------------------------------------------------
// MESSAGES MANAGEMENT
// ---------------------------------------------------------
async function loadAdminMessages() {
    const tbody = document.getElementById('adminMessagesTableBody');
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading customer messages...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/api/contact`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            const messages = data.messages;
            if (messages.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No customer messages received yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = messages.map(m => `
                <tr>
                    <td>#${m.id}</td>
                    <td><strong>${escapeHtml(m.name)}</strong></td>
                    <td>${escapeHtml(m.email)}</td>
                    <td><strong>${escapeHtml(m.subject)}</strong></td>
                    <td style="max-width:300px; white-space:normal;">${escapeHtml(m.message)}</td>
                    <td>
                        <button onclick="deleteMessage(${m.id})" class="btn btn-danger btn-sm">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function deleteMessage(msgId) {
    if (!confirm('Delete this contact message?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/${msgId}`, { method: 'DELETE', credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            loadAdminMessages();
            loadAdminStats();
        }
    } catch (error) {
        console.error('Delete message error:', error);
    }
}

// ---------------------------------------------------------
// ORDERS MANAGEMENT
// ---------------------------------------------------------
async function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading customer orders...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/api/orders`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            const orders = data.orders;
            if (orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders placed yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td>#ORD-${o.id}</td>
                    <td>${escapeHtml(o.user_name)}<br><small style="color:var(--text-muted);">${escapeHtml(o.user_email)}</small></td>
                    <td><strong>${escapeHtml(o.book_title)}</strong> (x${o.quantity})</td>
                    <td style="font-weight:700; color:var(--primary);">$${parseFloat(o.total_price).toFixed(2)}</td>
                    <td style="max-width:200px; font-size:0.85rem;">${escapeHtml(o.shipping_address)}</td>
                    <td>
                        <select onchange="updateOrderStatus(${o.id}, this.value)" class="form-control" style="padding:0.3rem; font-size:0.85rem;">
                            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td style="font-size:0.82rem; color:var(--text-muted);">${new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading admin orders:', error);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if (data.success) {
            console.log(`Order #${orderId} updated to ${newStatus}`);
        } else {
            alert(data.message || 'Failed to update order status');
        }
    } catch (error) {
        console.error('Update status error:', error);
    }
}
