import { generateAccessToken,paypal } from "../lib/paypal";

test("generate access token", async () => {
    const accessToken = await generateAccessToken();
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);
})

// Test to create a paypal order
test('creates a paypal order', async () => {
    const price = 10.0;
    const orderResponse = await paypal.createOrder(price);
    expect(orderResponse).toHaveProperty('id');
    expect(orderResponse.status).toBe('CREATED');
});
  
// Test to capture payment with a mock order
test('simulate capturing payment from an order', async () => {
    const orderId = 'mock-order-id';
    const mockCapturePayment = jest.
    fn().mockResolvedValue({
        id: 'mock-capture-id',
        status: 'COMPLETED',
    });
    jest.spyOn(paypal, 'captureOrder').mockImplementation(mockCapturePayment);
    const captureResponse = await paypal.captureOrder(orderId);
    expect(mockCapturePayment).toHaveBeenCalledWith(orderId);
    expect(captureResponse).toHaveProperty('id');
    expect(captureResponse.status).toBe('COMPLETED');
    // Clean up the mock
    jest.restoreAllMocks();
});