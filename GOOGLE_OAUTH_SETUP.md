# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Tourism Platform.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Tourism Platform"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (your email address)
6. Save and continue

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - Name: "Tourism Platform Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5001`
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback`
5. Click "Create"

## Step 4: Get Your Credentials

After creating the OAuth client, you'll get:
- Client ID
- Client Secret

## Step 5: Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tourism-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Session Configuration
SESSION_SECRET=your-session-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client URL
CLIENT_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
```

## Step 6: Test the Setup

1. Start the backend server: `npm run server`
2. Start the frontend: `npm run client`
3. Go to the login or register page
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth consent screen
6. After authorization, you should be redirected back to the application

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure the redirect URI in Google Console matches exactly: `http://localhost:5001/api/auth/google/callback`

2. **"invalid_client" error**
   - Check that your Client ID and Client Secret are correct
   - Make sure you're using the correct credentials for the right environment

3. **CORS errors**
   - Ensure the authorized origins include both `http://localhost:3000` and `http://localhost:5001`

4. **Session errors**
   - Make sure SESSION_SECRET is set in your environment variables

### Production Deployment:

For production, you'll need to:

1. Update the authorized origins and redirect URIs in Google Console to use your production domain
2. Set `NODE_ENV=production` in your environment variables
3. Use HTTPS URLs for all OAuth configurations
4. Update the CLIENT_URL to your production frontend URL

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- Regularly rotate your Google OAuth credentials
- Monitor your OAuth usage in Google Cloud Console 