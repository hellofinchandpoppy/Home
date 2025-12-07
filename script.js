// script.js v5.3 – FIXED CART DRAWER + STRIPE CHECKOUT
let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];
const SHIPPING = 800; // $8.00 in cents

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price) * 100;
            const existing = cart.find(item => item.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCart();
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

        const response = await fetch('https://stripe-checkout-proxy.netlify.app/.netlify/functions/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItems })
        });

        const { sessionId } = await response.json();
        stripe.redirectToCheckout({ sessionId });
    });
});

function updateCart() {
    const itemsDiv = document.getElementById('cart-items');
    const subtotalSpan = document.getElementById('cart-subtotal');
    const totalSpan = document.getElementById('cart-total');
    const countSpan = document.getElementById('cart-count');

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
    subtotalSpan.textContent = (subtotal / 100).toFixed(2);
    totalSpan.textContent = (total / 100).toFixed(2);
    countSpan.textContent = cart.reduce((s, i) => s + i.qty, 0);
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
