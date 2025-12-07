// script.js v4.2 – FINAL REAL PAYMENTS (Stripe Checkout)
let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price) * 100; // Stripe uses cents
            const existing = cart.find(item => item.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCart();
        });
    });

    // Checkout button
    document.getElementById('checkout')?.addEventListener('click', async () => {
        if (cart.length === 0) return alert('Your cart is empty!');

        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: item.price,
            },
            quantity: item.qty,
        }));

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
                <button class="btn btn-sm text-danger" onclick="cart.splice(${i},1);localStorage.setItem('finchpoppy-cart',JSON.stringify(cart));updateCart()">×</button>
            </div>`;
    });
    totalSpan.textContent = (total / 100).toFixed(2);
}
