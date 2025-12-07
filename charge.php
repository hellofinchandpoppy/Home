<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://yourusername.github.io'); // ← Change to your real GitHub Pages URL
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'vendor/autoload.php'; // You’ll add this in a second

\Stripe\Stripe::setApiKey('sk_live_51YOURSECRETKEYHERE1234567890'); // ← Replace with YOUR secret key

$payload = json_decode(file_get_contents('php://input'), true);
$items = $payload['items'];
$email = $payload['email'];

$line_items = array_map(function($item) {
    return [
        'price_data' => [
            'currency' => 'usd',
            'product_data' => ['name' => $item['name']],
            'unit_amount' => $item['price'],
        ],
        'quantity' => $item['qty'],
    ];
}, $items);

$session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => $line_items,
    'mode' => 'payment',
    'success_url' => 'https://yourusername.github.io/finchandpoppy/success.html',
    'cancel_url' => 'https://yourusername.github.io/finchandpoppy/shop.html',
    'customer_email' => $email,
]);

echo json_encode(['clientSecret' => $session->id]);
?>
