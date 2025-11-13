import authConfig from "../auth_config.json";

export const resetPassword = async (auth0) => {
  const token = await auth0.getAccessTokenSilently();

  const response = await fetch(`${authConfig.serverAPI}/api/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
