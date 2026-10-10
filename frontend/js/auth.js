// Authentication JS (Register & Login Forms)

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    initLoginForm();
});

// Register Form Handling
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('regName');
        const emailInput = document.getElementById('regEmail');
        const passwordInput = document.getElementById('regPassword');
        const confirmPasswordInput = document.getElementById('regConfirmPassword');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset errors
        clearFormErrors();

        let isValid = true;

        if (!name) {
            showInputError('regName', 'Full name is required.');
            isValid = false;
        }

        if (!email || !validateEmail(email)) {
            showInputError('regEmail', 'Please enter a valid email address.');
            isValid = false;
        }

        if (password.length < 6) {
            showInputError('regPassword', 'Password must be at least 6 characters.');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showInputError('regConfirmPassword', 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('alertContainer', 'Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'user-dashboard.html';
                }, 1200);
            } else {
                showAlert('alertContainer', data.message || 'Registration failed.', 'danger');
            }
        } catch (error) {
            console.error('Registration network error:', error);
            showAlert('alertContainer', 'Server error. Please try again later.', 'danger');
        }
    });
}

// Login Form Handling
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Auto fill credentials demo helper buttons
    const demoUserBtn = document.getElementById('demoUserBtn');
    const demoAdminBtn = document.getElementById('demoAdminBtn');

    if (demoUserBtn) {
        demoUserBtn.addEventListener('click', () => {
            document.getElementById('loginEmail').value = 'john@example.com';
            document.getElementById('loginPassword').value = 'user123';
        });
    }

    if (demoAdminBtn) {
        demoAdminBtn.addEventListener('click', () => {
            document.getElementById('loginEmail').value = 'admin@bookhub.com';
            document.getElementById('loginPassword').value = 'admin123';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        clearFormErrors();
        let isValid = true;

        if (!email || !validateEmail(email)) {
            showInputError('loginEmail', 'Please enter a valid email.');
            isValid = false;
        }

        if (!password) {
            showInputError('loginPassword', 'Password is required.');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('alertContainer', 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1000);
            } else {
                showAlert('alertContainer', data.message || 'Invalid login credentials.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('alertContainer', 'Server error. Please try again.', 'danger');
        }
    });
}

function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('form-error')) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
}

function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
