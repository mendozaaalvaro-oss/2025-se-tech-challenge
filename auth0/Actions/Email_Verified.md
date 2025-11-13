exports.onExecutePostLogin = async (event, api) => {
    api.accessToken.setCustomClaim(
    "https://pizza42/email_verified",
    event.user.email_verified
  );
};