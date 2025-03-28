const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

export const paypal ={
    createOrder: async function createOrder(price: number) {
        const accessToken = await generateAccessToken();
        const response = await fetch(`${base}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: price
                        }
                    }
                ]
            })
        });
        
        return handleResponse(response);
    },
    captureOrder: async function captureOrder(orderId: string) {
        const accessToken = await generateAccessToken();
        const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return handleResponse(response);
    }
}

async function handleResponse(response:Response) {
    if(response.ok){
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(errorMessage);
    
}

async function generateAccessToken(){
    const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString('base64');
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

export { generateAccessToken }