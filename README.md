# Pizza 42 — SE Tech Challenge

## Three Business Challenges

### 1. Offload Credential Management

- Connect securely to existing databases via Auth0's Custom Database Scripts and migrate users automatically by enabling the Import Mode toggle on the connection [`auth0/dbScripts/`](auth0/dbScripts/)
- Scope-based authorization (`create:orders`) controls access to the POST /api/orders endpoint using Auth0's `express-oauth2-jwt-bearer` package.
  -  Scopes are requested during authentication in [`src/index.js#L25`](src/index.js#L25) and enforced server-side via `requiredScopes()` in [`api-server.js#L75`](api-server.js#L75)
- Verification email can be sent in-app for existing users with unverified emails[`server-services/auth0API.js:65-78`](server-services/auth0API.js#L65-L78)

### 2. Frictionless & Customizable Login Experience

- Passwordless authentication using one-time codes and passkeys are enabled for the database connection
- Automatically merge passwordless and password accounts using Auth0 Actions
- Social connections take only minutes to configure 
- Self-service password recovery available both via Auth0 Universal Login and in-app
- Brand and customize your login experience for a unified mobile/web experience  

Implementation references:
- One-Time Code via email [`src/components/Content.js:120-122`](src/components/Content.js#L120-L122)
- Account linking Action [`auth0/Actions/AccountLinking.md`](auth0/Actions/AccountLinking.md)
- Password reset API call [`server-services/auth0API.js#L80-L97`](server-services/auth0API.js#L80-L97) 

### 3. Enrich Customer Data at Login

- Store customer's order history in `app_metadata` (non-editable by the user)
- Add order history to ID token claims
- Email verification status is added to Access Token for server-side validation

Implementation references:
- Orders stored as non-editable user metadata [`server-services/auth0API.js:52-63`](server-services/auth0API.js#L52-L63)
and automatically updated when new orders placed [`api-server.js:46-68`](api-server.js#L46-L68)
- Inject `app_metadata` into ID token [`auth0/Actions/AppMDtoCustomClaims.md`](auth0/Actions/AppMDtoCustomClaims.md)
- Inject email_verified status into Access Token[`auth0/Actions/Email_Verified.md`](auth0/Actions/Email_Verified.md)
and the server validates this before allowing orders [`server-services/userValidation.js:15-27`](server-services/userValidation.js#L15-L27)

## Architecture Diagram

<img width="2496" height="1448" alt="image" src="https://github.com/user-attachments/assets/e5c0f2e6-6627-4881-8bbe-980834ac936c" />

## Configuration Guide

To configure this application with your Auth0 tenant, update the configuration file with your credentials.

Edit the [src/auth_config.json](src/auth_config.json) file and replace the placeholder values with your Auth0 information:

- `domain`: Your Auth0 tenant custom domain
- `canonical_domain`: Your Auth0 tenant canonical domain (needed as the audience for client credential flows)
- `clientId`: Your Auth0 SPA application client ID
- `audience`: Your API identifier for your API server
- `managementClientId`: Auth0 Management API client ID (M2M Application)
- `managementClientSecret`: Auth0 Management API client secret (M2M Application)
- `connection`: The name of your Auth0 database connection
- `serverAPI`: Backend API URL
- `appOrigin`: Frontend application URL

## How It Works

- Uses [`@auth0/auth0-react`](https://www.npmjs.com/package/@auth0/auth0-react) SDK for authentication  
  - Implements `Auth0Provider` wrapper for the app  
  - Protected routes require authentication  
- JWT and scope validation accomplished using Auth0's[`express-oauth2-jwt-bearer`](https://www.npmjs.com/package/express-oauth2-jwt-bearer) package
- Auth0 Management API integration to manage user data  
  - Management API token is cached in server memory to avoid multiple token requests  
- The information from the `app_metadata`is added to the ID token using Auth0 Actions.
- Silent token refreshes run in the background without user interaction
  
After updating this file, start both the frontend and backend servers for the changes to take effect. Dockerfile is configured to run `yarn start`. 

## License

This demo application is only for the purpose of this tech challenge
