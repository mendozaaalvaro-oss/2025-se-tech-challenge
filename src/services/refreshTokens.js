import authConfig from '../auth_config.json';

export const refreshTokens = async (auth0) => {
  await auth0.getAccessTokenSilently({
    cacheMode: 'off',
    authorizationParams: {
      scope: authConfig.scope
    }
  });

  return await auth0.getIdTokenClaims();
};
