const getManagementAccessToken = async (event, api) => {
  const { AuthenticationClient } = require('auth0');

  const mgtToken = 'mgmt-api-token';
  const { value: cached } = api.cache.get(mgtToken) || {};
  if (cached) return cached;

  const authentication = new AuthenticationClient({
    domain: event.secrets.DOMAIN,
    clientId: event.secrets.CLIENT_ID,
    clientSecret: event.secrets.CLIENT_SECRET
  });

  const {
    data: { access_token, expires_in },
  } = await authentication.oauth.clientCredentialsGrant({
    audience: `https://${event.secrets.CANONICAL_DOMAIN}/api/v2/`,
  });

  api.cache.set(mgtToken, access_token, { ttl: expires_in });
  return access_token;
};

const getManagementClient = async (event, api) => {
  const { ManagementClient } = require('auth0');
  const token = await getManagementAccessToken(event, api);
  return new ManagementClient({
    domain: event.secrets.DOMAIN,
    token
  });
};

const connection = 'email';

exports.onExecutePostLogin = async (event, api) => {
  const strategy = event.connection.strategy;
  if (!connection.includes(strategy)) return;

  if (event.user.app_metadata?.pwdless_linked) {
    console.log('Account linking already completed for this user');
    return;
  }

  const email = event.user.email;
  // if (!email) return;
  // if (!event.user.email_verified) return;

  try {
    const management = await getManagementClient(event, api);

    let users;
    try {
      const result = await management.users.list({
        u: `email:"${email}"`
      });

      users = Array.isArray(result) ? result : result?.data || [];
      console.log(`Found ${users.length} users with email ${email}`);
    } catch (error) {
      console.error('Error fetching users by email:', {
        message: error.message,
        statusCode: error.statusCode
      });
      return;
    }

    const primaryUser = users.find(u =>
      Array.isArray(u.identities) && u.identities.some(id => id.provider === 'auth0')
    );

    if (!primaryUser) {
      console.log('No database user found with this email, skipping linking');
      return;
    }

    const primaryUserId = primaryUser.user_id;
    const secondaryUserId = event.user.user_id;
    const [provider, secId] = secondaryUserId.split('|');

    console.log(`Linking ${secondaryUserId} to ${primaryUserId}`);
    try {
      const linkResult = await management.users.identities.link(primaryUserId, {
        provider,
        user_id: secId
      });

      if (linkResult) {
        console.log('Successfully linked accounts');

        const secondaryOrders = event.user.app_metadata?.orders || [];
        const primaryOrders = primaryUser.app_metadata?.orders || [];

        const mergedOrders = [...primaryOrders, ...secondaryOrders];

        const updatedAppMetadata = {
          orders: mergedOrders,
          pwdless_linked: true
        };

        await management.users.update(
           primaryUserId,
          { app_metadata: updatedAppMetadata }
        );
        
        api.authentication.setPrimaryUser(primaryUserId);
      }

    } catch (linkError) {
      console.error('Error in link operation:', {
        message: linkError.message,
        statusCode: linkError.statusCode
      });
      return;
    }
  } catch (error) {
    console.error('Unexpected error linking accounts:', {
      message: error.message,
      statusCode: error.statusCode
    });
  }
};
