# Pizza 42 — SE Tech Challenge

## How It Works

- Uses [`@auth0/auth0-react`](https://www.npmjs.com/package/@auth0/auth0-react) SDK for authentication  
- Implements `Auth0Provider` wrapper for the app  
- Protected routes require authentication  
- JWT and scope validation accomplished using Auth0's[`express-oauth2-jwt-bearer`](https://www.npmjs.com/package/express-oauth2-jwt-bearer) package
- Auth0 Management API integration to manage user data  
  - Management API token is cached in server memory to avoid multiple token requests  
- The information from the `app_metadata`is added to the ID token using Auth0 Actions.
- Silent token refreshes run in the background without user interaction, with rotation enabled for security  

## Three Business Challenges

### 1. Offload Credential Management

- Connect securely to existing databases via Auth0's Custom Database Scripts and migrate users Just-In-Time (JIT) by enabling the Import Mode toggle on the connection
  - Example database scripts [`auth0/dbScripts/`](auth0/dbScripts/)
- Scope-based authorization (`create:orders`) controls access to API endpoints using Auth0's `express-oauth2-jwt-bearer` package.
  - Scopes are requested during authentication in [`src/index.js#L25`](src/index.js#L25) and enforced server-side via `requiredScopes()` in [`api-server.js#L75`](api-server.js#L75)

### 2. Frictionless & Customizable Login Experience

- Passwordless authentication using codes and passkeys are enabled for the database connection 
- Self-service password recovery available both via Auth0 Universal Login and in-app
  - In-app password reset request [`server-services/auth0API.js#L80-L97`](server-services/auth0API.js#L80-L97)
- Social connections take only minutes to configure  
- Automatically merge passwordless and password accounts using Auth0 Actions
  - Account linking Action [`auth0/Actions/AccountLinking.md`](auth0/Actions/AccountLinking.md)  
- Brand and customize your login experience for a unified mobile/web experience

### 3. Enrich Customer Data at Login

- Store customer's order history in `app_metadata` (non-editable by the user)
  - Store orders in `app_metadata` [`server-services/auth0API.js#L52-L63`](server-services/auth0API.js#L52-L63)
- Inject order history directly into ID tokens
  - Inject `app_metadata` into ID token [`auth0/Actions/AppMDtoCustomClaims.md`](auth0/Actions/AppMDtoCustomClaims.md)  

## Configuration Guide

To configure this application with your Auth0 tenant, update the configuration file with your credentials.

Edit the [src/auth_config.json](src/auth_config.json) file and replace the placeholder values with your Auth0 information:

- `domain`: Your Auth0 tenant domain
- `clientId`: Your Auth0 SPA application client ID
- `audience`: Your API identifier for your API server
- `managementClientId`: Auth0 Management API client ID (M2M Application)
- `managementClientSecret`: Auth0 Management API client secret (M2M Application)
- `connection`: The name of your Auth0 database connection
- `serverAPI`: Backend API URL
- `appOrigin`: Frontend application URL

After updating this file, restart both the frontend and backend servers for the changes to take effect.

## Application Architecture
 
### Directory Structure

```plaintext
2025-se-tech-challenge/
├── public/                           # Static asset
├── src/
│   ├── components/                   # React components
│   │   ├── Content.js
│   │   ├── Footer.js
│   │   ├── Hero.js
│   │   ├── Loading.js
│   │   ├── NavBar.js
│   │   ├── Orders.js
│   │   └── Profile.js
│   ├── services/
│   │   ├── placeOrder.js
│   │   ├── refreshTokens.js
│   │   ├── sendVerificationEmail.js
│   │   └── resetPassword.js
│   ├── utils/
│   │   ├── pizzas.js
│   │   └── history.js                # React Router history
│   ├── views/
│   │   ├── Home.js                   # Home page (Auth0 protected)
│   │   ├── MyProfile.js              # Profile page (Auth0 protected)
│   │   └── MyOrders.js               # Orders page (Auth0 protected)
│   ├── App.css
│   ├── App.js                        # Main app component
│   ├── auth_config.json              # Auth0 configuration file
│   └── index.js                      # App entry point with Auth0Provider
├── server-services/
│   ├── auth0API.js                   # Auth0 API calls
│   └── userValidation.js             # User ID and email_verified checks
├── auth0/
│   ├── Actions/
│   │   ├── AccountLinking.md         # Links passwordless user to DB user
│   │   ├── AppMDtoCustomClaims.md    # Adds orders from app_metadata to ID token
│   │   └── Email_Verified.md         # Adds email_verified value to access token
│   └── dbScripts/
│       ├── login.md                  # Custom Database login script
│       └── getUser.md                # Custom Database getUser script
├── api-server.js                     # API server and JWT validation
├── package.json
├── Dockerfile
└── README.md
```

## License

This demo application is only for the purpose of this tech challenge
