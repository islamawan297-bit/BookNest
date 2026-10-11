// Contact Form Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const subjectInput = document.getElementById('contactSubject');
        const messageInput = document.getElementById('contactMessage');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        clearContactErrors();
        let isValid = true;

        if (!name) {
            showContactError('contactName', 'Please enter your name.');
            isValid = false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showContactError('contactEmail', 'Please enter a valid email address.');
            isValid = false;
        }

        if (!subject) {
            showContactError('contactSubject', 'Subject is required.');
            isValid = false;
        }

        if (!message) {
            showContactError('contactMessage', 'Please write a message.');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('contactAlert', data.message, 'success');
                contactForm.reset();
            } else {
                showAlert('contactAlert', data.message || 'Failed to send message.', 'danger');
            }
        } catch (error) {
            console.error('Contact submit error:', error);
            showAlert('contactAlert', 'Network error. Please try again later.', 'danger');
        }
    });
}

function showContactError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('form-error')) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
}

function clearContactErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}
