import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";
import authConfig from "./auth_config.json";

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

const audience = authConfig.audience && authConfig.audience !== "{yourApiIdentifier}"
  ? authConfig.audience
  : null;

const providerConfig = {
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(audience ? { audience } : null),
    scope: authConfig.scope,
  },
  useRefreshTokens: true,
  useRefreshTokensFallback: false,
  cacheLocation: 'localstorage',
};

const root = createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    {...providerConfig}
  >
    <App />
  </Auth0Provider>,
);
