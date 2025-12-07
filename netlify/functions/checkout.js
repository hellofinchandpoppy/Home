const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async ({ body }) => {
    try {
        const { lineItems } = JSON.parse(body);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://hellofinchandpoppy.github.io/Home/thank-you.html',
            cancel_url: 'https://hellofinchandpoppy.github.io/Home/shop.html',
        });
        return { statusCode: 200, body: JSON.stringify({ sessionId: session.id }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
