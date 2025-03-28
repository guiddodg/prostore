import { generateAccessToken } from "../lib/paypal";

test("generate access token", async () => {
    const accessToken = await generateAccessToken();
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);
})