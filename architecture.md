# AdsConnect Architecture

## System Architecture

### Frontend (React + TypeScript)
The frontend application is built using React with TypeScript for type safety. It follows a component-based architecture with the following key components:

#### Core Components
- **AuthContext**: Central authentication state management
- **ConnectionStatus**: Amazon Advertising account connection management
- **ApiKeyManagement**: API key generation and management
- **Layout Components**: Header, Footer, and Container for consistent UI

#### Pages
- **Index**: Landing page with marketing content
- **Auth**: User authentication (sign-in/sign-up)
- **Dashboard**: Main interface after authentication
- **AuthCallback**: Handles OAuth callback from Amazon

### Backend (Supabase)
Supabase provides the backend infrastructure with the following components:

#### Authentication
- Supabase Auth for user authentication
- Custom JWT handling for secure sessions

#### Database
PostgreSQL database with the following tables:
- **amazon_tokens**: Stores Amazon API tokens securely
- **api_keys**: Manages developer API keys
- **advertisers**: Stores connected Amazon Advertising accounts
- **campaigns**: Stores campaign data
- **campaign_metrics**: Tracks performance metrics
- **profiles**: Stores user profile information

#### Edge Functions
- **amazon-auth**: Handles Amazon OAuth token exchange
- **fetch-amazon-profiles**: Fetches advertiser profile data
- **fetch-amazon-campaigns**: Retrieves campaign data

### Integration with Amazon Advertising API
The system integrates with Amazon Advertising API through:
- Login with Amazon (LWA) OAuth flow
- Token management (access and refresh tokens)
- API calls for profile and campaign data

## Data Flow

### Authentication Flow
1. User signs in to AdsConnect platform (Supabase Auth)
2. User clicks "Connect Amazon Ads" button
3. Popup opens with Amazon authorization screen
4. User grants permissions to AdsConnect
5. Amazon redirects to callback URL with authorization code
6. Edge function exchanges code for access/refresh tokens
7. Tokens are securely stored in Supabase
8. UI updates to show "Connected" status

### API Key Flow
1. Authenticated user generates API key
2. Key is securely stored in Supabase
3. Developer uses API key to access endpoints
4. Edge functions validate API key and use appropriate Amazon tokens
5. Data is returned to developer application

### Data Synchronization Flow
1. Scheduled jobs refresh Amazon tokens
2. Edge functions fetch updated profile and campaign data
3. Data is stored in Supabase for quick access
4. Frontend displays latest data to users

## Security Considerations

### Token Security
- Access and refresh tokens encrypted at rest
- Tokens never exposed to frontend
- Automatic token rotation on expiration

### API Key Security
- Keys generated with cryptographic security
- Rate limiting to prevent abuse
- Detailed access logs for audit purposes

### Data Protection
- Row-level security in Supabase
- Role-based access controls
- Encryption for sensitive data

## Technical Stack

### Frontend
- React 18+
- TypeScript
- Supabase JS Client
- React Router
- Tailwind CSS (or other styling solution)

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Edge Functions (Deno)
- Supabase Storage (if needed)

### Development Tools
- Node.js
- npm/yarn
- Git
- ESLint/Prettier
- Jest (for testing)

## Deployment Strategy
- Frontend: Vercel, Netlify, or similar
- Backend: Supabase Cloud
- CI/CD: GitHub Actions or similar

## Monitoring and Analytics
- Supabase monitoring tools
- Custom logging for critical operations
- Error tracking and reporting
