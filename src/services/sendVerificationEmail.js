import authConfig from "../auth_config.json";

export const sendVerificationEmail = async (auth0) => {
  const token = await auth0.getAccessTokenSilently();

  const response = await fetch(`${authConfig.serverAPI}/api/send-verification-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ client_id: authConfig.clientId })
  });

  if (!response.ok) throw new Error('Failed to send email');
  return await response.json();
};
