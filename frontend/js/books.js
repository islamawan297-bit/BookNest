// Books Catalog & Search JS

let allBooks = [];
let activeCategory = 'All';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initBooksCatalog();
});

async function initBooksCatalog() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return; // Not on catalog page

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        activeCategory = categoryParam;
    }

    setupSearchAndFilters();
    await fetchBooks();
}

async function fetchBooks() {
    const booksGrid = document.getElementById('booksGrid');
    try {
        booksGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <p>Loading books library...</p>
            </div>
        `;

        let url = `${API_BASE_URL}/api/books`;
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory);
        if (searchQuery) params.append('search', searchQuery);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            allBooks = data.books;
            renderBooks(allBooks);
        } else {
            booksGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--danger);">
                    <p>Failed to load books. Please refresh.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        booksGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--danger);">
                <p>Network error connecting to backend API.</p>
            </div>
        `;
    }
}

function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    if (!books || books.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--border);">
                <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1rem;">No books found matching your criteria.</p>
                <button onclick="resetFilters()" class="btn btn-secondary btn-sm">Reset Filters</button>
            </div>
        `;
        return;
    }

    booksGrid.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-cover">
                <span class="category-badge">${escapeHtml(book.category)}</span>
                <img src="${escapeHtml(book.cover_image)}" alt="${escapeHtml(book.title)}" loading="lazy" 
                     onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';">
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span class="book-price">$${parseFloat(book.price).toFixed(2)}</span>
                    <span class="book-rating">★ ${book.rating ? book.rating.toFixed(1) : '4.5'}</span>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <a href="book-details.html?id=${book.id}" class="btn btn-outline btn-sm" style="flex: 1;">Details</a>
                    <button onclick="openQuickViewModal(${book.id})" class="btn btn-primary btn-sm" style="flex: 1;">Order</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value.trim();
                fetchBooks();
            }, 300);
        });
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            const btnCat = btn.getAttribute('data-category') || 'All';
            if (btnCat === activeCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }

            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category') || 'All';
                fetchBooks();
            });
        });
    }
}

function resetFilters() {
    activeCategory = 'All';
    searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === 'All');
    });

    fetchBooks();
}

// Quick View / Order Modal Handler
async function openQuickViewModal(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
        const data = await response.json();

        if (!data.success || !data.book) {
            alert('Failed to load book details.');
            return;
        }

        const book = data.book;
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal active" id="quickOrderModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Order Book</h3>
                        <button class="close-modal" onclick="closeModal('quickOrderModal')">✕</button>
                    </div>
                    <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <img src="${escapeHtml(book.cover_image)}" style="width: 110px; height: 150px; object-fit: cover; border-radius: var(--radius-sm);" alt="${escapeHtml(book.title)}">
                        <div>
                            <h4 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${escapeHtml(book.title)}</h4>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Author: ${escapeHtml(book.author)}</p>
                            <p style="color: var(--primary); font-weight: 700; font-size: 1.25rem; margin: 0.5rem 0;">$${parseFloat(book.price).toFixed(2)}</p>
                            <p style="font-size: 0.85rem; color: ${book.stock > 0 ? 'var(--success)' : 'var(--danger)'};">
                                ${book.stock > 0 ? `In Stock (${book.stock} available)` : 'Out of Stock'}
                            </p>
                        </div>
                    </div>
                    <div id="modalAlertContainer"></div>
                    <form id="quickOrderForm">
                        <input type="hidden" id="orderBookId" value="${book.id}">
                        <div class="form-group">
                            <label class="form-label">Quantity</label>
                            <input type="number" id="orderQuantity" class="form-control" value="1" min="1" max="${book.stock}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Shipping Address</label>
                            <textarea id="orderAddress" class="form-control" rows="2" placeholder="Enter full delivery address" required></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                            <button type="button" onclick="closeModal('quickOrderModal')" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-primary" ${book.stock <= 0 ? 'disabled' : ''}>Confirm Order</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('quickOrderForm').addEventListener('submit', handlePlaceOrder);
    } catch (error) {
        console.error('Error opening quick view modal:', error);
    }
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    const bookId = document.getElementById('orderBookId').value;
    const quantity = document.getElementById('orderQuantity').value;
    const shipping_address = document.getElementById('orderAddress').value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id: bookId, quantity, shipping_address })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('modalAlertContainer', 'Order placed successfully!', 'success');
            setTimeout(() => {
                closeModal('quickOrderModal');
                window.location.href = 'user-dashboard.html';
            }, 1200);
        } else {
            if (response.status === 401) {
                showAlert('modalAlertContainer', 'Please log in to place an order.', 'danger');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            } else {
                showAlert('modalAlertContainer', data.message || 'Failed to place order.', 'danger');
            }
        }
    } catch (error) {
        console.error('Order network error:', error);
        showAlert('modalAlertContainer', 'Server error. Please try again.', 'danger');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}
