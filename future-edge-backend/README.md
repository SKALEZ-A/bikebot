# Refuel Trading Bot Backend

This is the backend API for the Refuel Trading Bot, providing wallet management functionality for the Telegram bot.

## Features

- Wallet creation, import, and management
- Wallet settings management
- Referral code generation
- Support for multiple chains (ETH, BSC, MONAD)

## API Base Path

The API is accessible at `/api/refuel-trading`

## API Endpoints

- **POST /wallet**: Create or update a wallet
- **GET /wallet/:telegramId**: Get all wallets for a user
- **GET /wallet/:telegramId/:walletName**: Get a specific wallet
- **DELETE /wallet/:telegramId/:walletName**: Delete a wallet
- **GET /wallet/settings/:telegramId/:walletName**: Get wallet settings
- **PUT /wallet/settings/:telegramId/:walletName**: Update wallet settings
- **POST /wallet/generateReferral/:telegramId**: Generate a referral code

## Prerequisites

- Node.js >= 16.x
- MongoDB

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3002
   ```

## Running Locally

```
npm run dev
```

## Deployment to Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: refuel-trading-backend
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
4. Add environment variables:
   - MONGODB_URI (your MongoDB connection string)
   - NODE_ENV=production
5. Deploy the service

## Connecting the Telegram Bot

Update the Telegram bot configuration to use the new backend URL with the correct API base path:

```javascript
const BASE_URL = 'https://your-render-app-name.onrender.com';
```

All API requests should use the path `/api/refuel-trading/wallet` as the base path.

## Troubleshooting

If you encounter errors, check:

1. MongoDB connection
2. API endpoint paths in the Telegram bot
3. Request payloads (missing required fields)
4. Server logs on Render.com

## License

ISC 