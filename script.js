// script.js v1.0 – FIXED CART DRAWER + STRIPE CHECKOUT + CONTACT FORM
let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];
const SHIPPING = 800; // $8.00 in cents

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    // Navbar scroll for thin effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Contact form with EmailJS
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        emailjs.init('xAPU3Px_xWU6VY7w7');
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await emailjs.sendForm('service_g80ginn', 'template_o0m9ai9', contactForm);
                alert('Message sent successfully!');
                contactForm.reset(); // Clear form
            } catch (err) {
                alert('Error sending message: ' + err.text);
            }
        });
    }

    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = Math.round(parseFloat(btn.dataset.price) * 100); // Fix precision
            const existing = cart.find(item => item.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCart();
            alert('Added to cart!'); // UX feedback
        });
    });

    // Checkout button
    document.getElementById('checkout')?.addEventListener('click', async () => {
        if (cart.length === 0) return alert('Your cart is empty');
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: item.price,
            },
            quantity: item.qty,
        }));
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Shipping (Flat Rate USA)' },
                unit_amount: SHIPPING,
            },
            quantity: 1,
        });
        try {
            const response = await fetch('https://finchandpoppy.netlify.app/.netlify/functions/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineItems })
            });
            if (!response.ok) throw new Error('Network error');
            const { sessionId } = await response.json();
            stripe.redirectToCheckout({ sessionId });
        } catch (e) {
            alert('Checkout error: ' + e.message);
        }
    });
});

function updateCart() {
    const itemsDiv = document.getElementById('cart-items');
    const subtotalSpan = document.getElementById('cart-subtotal');
    const totalSpan = document.getElementById('cart-total');
    const countSpan = document.getElementById('cart-count');
    if (!itemsDiv) return; // Exit if not on shop page
    itemsDiv.innerHTML = '';
    let subtotal = 0;
    const fragment = document.createDocumentFragment();
    cart.forEach((item, i) => {
        subtotal += item.price * item.qty;
        const div = document.createElement('div');
        div.classList.add('d-flex', 'justify-content-between', 'py-2', 'border-bottom');
        div.innerHTML = `
            <span>${item.name} × ${item.qty}</span>
            <span>$${(item.price * item.qty / 100).toFixed(2)}</span>
            <button class="btn btn-sm text-danger remove-item" data-index="${i}">×</button>
        `;
        fragment.appendChild(div);
    });
    itemsDiv.appendChild(fragment);
    subtotalSpan.textContent = (subtotal / 100).toFixed(2);
    totalSpan.textContent = cart.length > 0 ? ((subtotal + SHIPPING) / 100).toFixed(2) : '0.00'; // Handle empty cart
    countSpan.textContent = cart.reduce((s, i) => s + i.qty, 0);

    // Add event listeners for remove buttons (avoids inline onclick)
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const i = parseInt(btn.dataset.index);
            removeItem(i);
        });
    });
}

function removeItem(i) {
    cart.splice(i, 1);
    localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
    updateCart();
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
}
