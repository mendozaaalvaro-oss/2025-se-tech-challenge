import authConfig from "../auth_config.json";
import { refreshTokens } from "./refreshTokens";

const placeOrder = async (auth0, items, total) => {
  const token = await auth0.getAccessTokenSilently();

  const response = await fetch(`${authConfig.serverAPI}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, total })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { code: errorData.code, message: errorData.error || 'Order failed' };
  }

  return await response.json();
};

export const handlePlaceOrder = async (auth0, cart, calculateTotal, history) => {
  if (cart.length === 0) {
    throw new Error("Cart is empty");
  }

  const result = await placeOrder(auth0, cart, calculateTotal());

  setTimeout(async () => {
    await refreshTokens(auth0);
    history.push('/orders', { refreshToken: true });
  }, 2000);

  return result;
};
