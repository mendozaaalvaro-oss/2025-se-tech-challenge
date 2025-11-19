const authConfig = require("../src/auth_config.json");

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return await response.json();
}

let cachedMgtToken = null;
let tokenExpiresAt = null;

async function getManagementAPIToken() {
  if (cachedMgtToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedMgtToken;
  }

  const tokenResponse = await fetchJSON(`https://${authConfig.domain}/oauth/token`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: authConfig.managementClientId,
      client_secret: authConfig.managementClientSecret,
      audience: `https://${authConfig.canonical_domain}/api/v2/`,
      grant_type: "client_credentials"
    })
  });

  cachedMgtToken = tokenResponse.access_token;
  tokenExpiresAt = Date.now() + (tokenResponse.expires_in - 300) * 1000;

  return cachedMgtToken;
}

async function getUserData(userId) {
  const managementToken = await getManagementAPIToken();
  const encodedUserId = encodeURIComponent(userId);

  return await fetchJSON(`https://${authConfig.domain}/api/v2/users/${encodedUserId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${managementToken}`
    }
  });
}

async function updateUserMetadata(userId, metadata) {
  const managementToken = await getManagementAPIToken();
  const encodedUserId = encodeURIComponent(userId);

  return await fetchJSON(`https://${authConfig.domain}/api/v2/users/${encodedUserId}`, {
    method: 'PATCH',
    body: JSON.stringify({ app_metadata: metadata }),
    headers: {
      Authorization: `Bearer ${managementToken}`
    }
  });
}

async function sendVerificationEmail(userId, clientId) {
  const managementToken = await getManagementAPIToken();

  return await fetchJSON(`https://${authConfig.domain}/api/v2/jobs/verification-email`, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      client_id: clientId
    }),
    headers: {
      Authorization: `Bearer ${managementToken}`
    }
  });
}

async function createPasswordResetTicket(userId, clientId) {
  const userData = await getUserData(userId);

  const response = await fetch(`https://${authConfig.domain}/dbconnections/change_password`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: clientId,
      email: userData.email,
      connection: authConfig.connection
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const responseText = await response.text();
  return { message: responseText, email: userData.email };
}

module.exports = {
  getUserData,
  updateUserMetadata,
  sendVerificationEmail,
  createPasswordResetTicket
};
