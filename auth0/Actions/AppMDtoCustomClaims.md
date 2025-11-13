exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://pizza42/orders';
    if (event.user.app_metadata.orders) {
      api.idToken.setCustomClaim(namespace, event.user.app_metadata.orders);
    }
};