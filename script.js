document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('finchpoppy-cart')) || [];
    
    const updateCartDisplay = () => {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        document.getElementById('cart-count').textContent = count;
        document.getElementById('cart-total').textContent = total.toFixed(2);
        
        const itemsDiv = document.getElementById('cart-items');
        itemsDiv.innerHTML = '';
        cart.forEach((item, i) => {
            itemsDiv.innerHTML += `<p>${item.name} × ${item.qty} = $${(item.price * item.qty).toFixed(2)}</p>`;
        });
    };

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const existing = cart.find(item => item.name === name);
            if (existing) existing.qty++;
            else cart.push({ name, price, qty: 1 });
            localStorage.setItem('finchpoppy-cart', JSON.stringify(cart));
            updateCartDisplay();
        });
    });

    document.getElementById('checkout')?.addEventListener('click', () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        let summary = 'Order Summary:\n\n';
        let total = 0;
        cart.forEach(item => {
            summary += `${item.name} × ${item.qty} = $${(item.price * item.qty).toFixed(2)}\n`;
            total += item.price * item.qty;
        });
        summary += `\nTotal: $${total.toFixed(2)}`;
        alert(summary + '\n\nPlease email info@finchandpoppy.com to complete your order.');
        cart = [];
        localStorage.removeItem('finchpoppy-cart');
        updateCartDisplay();
    });

    updateCartDisplay();
});
