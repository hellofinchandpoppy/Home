document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('real-checkout-btn');
    const emptyMessage = document.getElementById('empty-cart-message');
    // UPDATE THIS WITH YOUR REAL BUY ME A COFFEE LINKS
    const productLinks = {
        "Strawbanero Jam": "https://buymeacoffee.com/yourname/e/strawbanero",
        "Holiday Cheers Candle": "https://buymeacoffee.com/yourname/e/candle",
        "My Old Kentucky Farmhouse Spray": "https://buymeacoffee.com/yourname/e/spray",
        // Add every product here with its real link
    };
    function updateCart() {
        cartItemsDiv.innerHTML = '';
        let total = 0;
        let itemCount = 0;
        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            checkoutBtn.style.display = 'none';
        } else {
            emptyMessage.style.display = 'none';
            checkoutBtn.style.display = 'inline-block';
        }
        cart.forEach(item => {
            total += item.price * item.qty;
            itemCount += item.qty;
            const p = document.createElement('p');
            p.innerHTML = `<strong>${item.name}</strong> × ${item.qty} = $${(item.price * item.qty).toFixed(2)}`;
            cartItemsDiv.appendChild(p);
        });
        cartTotalSpan.textContent = total.toFixed(2);
        if (cartCountSpan) cartCountSpan.textContent = itemCount;
    }
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ name, price, qty: 1 });
            }
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCart();
            alert(`${name} added to cart!`);
        });
    });
    // Real checkout — opens your Buy Me a Coffee page with pre-filled items
    checkoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        // Build Buy Me a Coffee extras URL with all items
        let extras = cart.map(item =>
            `${encodeURIComponent(item.name)} ×${item.qty} ($${item.price})`
        ).join(' | ');
        const message = `Order from Finch & Poppy:\n\n${extras}\n\nTotal: $${cart.reduce((sum,i)=>sum+i.price*i.qty,0).toFixed(2)}`;
        const url = `https://buymeacoffee.com/yourname/extras?description=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    });
    updateCart();
});
