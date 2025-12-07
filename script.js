// script.js v4.0 – Internal Cart + Real Stripe Payments
let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];

const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY_HERE'); // ← Replace with your key
const elements = stripe.elements();

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price) * 100; // Stripe uses cents
            const existing = cart.find(item => item.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCartDisplay();
        });
    });

    // Checkout button
    document.getElementById('checkout')?.addEventListener('click', () => {
        if (cart.length === 0) return alert('Your cart is empty');
        document.getElementById('checkout-form').style.display = 'block';
        document.getElementById('cart-summary').style.display = 'none';
    });
});

function updateCartDisplay() {
    const itemsDiv = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    if (!itemsDiv || !totalSpan) return;

    itemsDiv.innerHTML = '';
    let total = 0;
    cart.forEach((item, i) => {
        total += item.price * item.qty;
        itemsDiv.innerHTML += `
            <div class="d-flex justify-content-between py-2 border-bottom">
                <span>${item.name} × ${item.qty}</span>
                <span>$${(item.price * item.qty / 100).toFixed(2)}</span>
                <button class="btn btn-sm text-danger" onclick="removeFromCart(${i})">×</button>
            </div>`;
    });
    totalSpan.textContent = (total / 100).toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Final payment (runs when user submits form)
async function createPayment() {
    const email = document.getElementById('email').value;
    const response = await fetch('https://yourdomain.com/charge', { // ← You’ll host this tiny file
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, email })
    });
    const { clientSecret } = await response.json();
    const result = await stripe.confirmCardPayment(clientSecret);
    if (result.error) alert(result.error.message);
    else {
        alert('Payment successful! Thank you for your order.');
        localStorage.removeItem('finchpoppy-cart');
        cart = [];
        updateCartDisplay();
    }
}
