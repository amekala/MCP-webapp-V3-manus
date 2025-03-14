# AdsConnect Project Requirements

## Overview
AdsConnect is a platform designed to simplify Amazon Advertising API authentication, making it easier for advertisers to connect their accounts and for developers to access advertising data securely.

## Core Requirements

### 1. User Authentication
- Implement user authentication using Supabase Auth
- Create login/signup flows for advertisers
- Manage user sessions and profile data

### 2. Amazon Advertising Integration
- Implement Login with Amazon (LWA) OAuth flow
- Handle authorization code exchange for access and refresh tokens
- Store tokens securely in Supabase
- Implement token refresh mechanism
- Fetch and store Amazon Advertising profiles
- Fetch and store campaign data

### 3. API Key Management
- Generate secure API keys for developers
- Store and manage API keys in Supabase
- Implement key revocation functionality
- Track API key usage

### 4. Frontend Components
- Create responsive UI for user authentication
- Build dashboard for managing Amazon connections
- Implement API key management interface
- Design landing page with product information

## Data Model

### User Profiles
- Basic user information
- Company details
- Avatar/profile images

### Amazon Tokens
- Access tokens
- Refresh tokens
- Expiration timestamps
- User associations
- Active status

### API Keys
- Unique key values
- Creation timestamps
- Last used timestamps
- Active status
- User associations

### Advertiser Accounts
- Profile IDs
- Marketplace information
- Account types
- Connection status
- User associations

### Campaigns
- Campaign types
- Budgets
- Status information
- Associated advertiser accounts

### Campaign Metrics
- Performance data (impressions, clicks, etc.)
- Spend information
- Sales data
- Associated campaigns

## Technical Architecture

### Frontend
- React-based SPA
- TypeScript for type safety
- Context API for state management
- Responsive design for all device sizes

### Backend
- Supabase for database and authentication
- Edge Functions for secure API operations
- PostgreSQL database for data storage

### Security Requirements
- Secure token storage (encryption at rest)
- API key protection
- Rate limiting for API access
- Role-based access controls
- Audit logging for sensitive operations

## User Flows

### Advertiser Authentication Flow
1. User signs in to AdsConnect platform
2. User clicks "Connect Amazon Ads" button
3. Popup opens with Amazon authorization screen
4. User grants permissions to AdsConnect
5. Amazon redirects to callback URL with authorization code
6. Edge function exchanges code for access/refresh tokens
7. Tokens are securely stored in Supabase
8. UI updates to show "Connected" status

### API Key Management Flow
1. User navigates to API Key Management section
2. User creates a new API key with a name
3. System generates and displays the key
4. User can copy, revoke, or regenerate keys
5. Usage metrics are displayed for active keys

## Implementation Priorities
1. User authentication with Supabase
2. Database table creation and configuration
3. Amazon OAuth integration
4. API key management functionality
5. Frontend component development
6. Testing and deployment
