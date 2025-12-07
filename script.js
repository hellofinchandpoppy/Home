// script.js v5.0 – Slide-out cart + $8 shipping + thank-you page
let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];
const SHIPPING = 800; // $8.00 in cents

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price) * 100;
            const existing = cart.find(i => i.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCart();
        });
    });

    document.getElementById('checkout')?.addEventListener('click', async () => {
        if (cart.length === 0) return alert('Cart is empty');

        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: item.price,
            },
            quantity: item.qty,
        }));

        // Add shipping
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Shipping (Flat Rate USA)' },
                unit_amount: SHIPPING,
            },
            quantity: 1,
        });

        const response = await fetch('https://stripe-checkout-proxy.netlify.app/.netlify/functions/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItems })
        });

        const { sessionId } = await response.json();
        const stripe = Stripe('pk_live_YOUR_KEY_HERE'); // ← Your publishable key
        stripe.redirectToCheckout({ sessionId });
    });
});

function updateCart() {
    const itemsDiv = document.getElementById('cart-items');
    const countSpan = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');
    const subtotalSpan = document.getElementById('cart-subtotal');

    if (!itemsDiv || !totalSpan) return;

    itemsDiv.innerHTML = '';
    let subtotal = 0;
    cart.forEach((item, i) => {
        subtotal += item.price * item.qty;
        itemsDiv.innerHTML += `
            <div class="d-flex justify-content-between py-2 border-bottom">
                <span>${item.name} × ${item.qty}</span>
                <span>$${(item.price * item.qty / 100).toFixed(2)}</span>
                <button class="btn btn-sm text-danger" onclick="removeItem(${i})">×</button>
            </div>`;
    });

    const total = subtotal + SHIPPING;
    if (countSpan) countSpan.textContent = cart.reduce((s,i)=>s+i.qty,0);
    if (subtotalSpan) subtotalSpan.textContent = (subtotal/100).toFixed(2);
    totalSpan.textContent = (total/100).toFixed(2);
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
