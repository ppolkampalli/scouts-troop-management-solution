# Scout Troop Management System - Backend

A comprehensive Node.js/Express.js backend API for managing Boy Scout troops across the USA.

## Features

- **Authentication**: JWT-based auth with social login support (Google, Facebook, Apple)
- **Role-Based Access Control**: Granular permissions for different user roles
- **Troop Management**: Complete troop administration functionality
- **Scout Management**: Scout profiles, advancement tracking, merit badges
- **Event Management**: Meetings, campouts, activities with RSVP system
- **Communication**: Messaging and notification system
- **Security**: COPPA & GDPR compliant with comprehensive security measures

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: Zod
- **Testing**: Jest
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional, for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Documentation

The API follows RESTful conventions and returns JSON responses.

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
All protected routes require an Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check
- `GET /health` - Server health status

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/facebook` - Facebook OAuth

#### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

#### Troops
- `GET /api/v1/troops` - List troops
- `POST /api/v1/troops` - Create troop
- `GET /api/v1/troops/:id` - Get troop details
- `PUT /api/v1/troops/:id` - Update troop
- `DELETE /api/v1/troops/:id` - Archive troop

#### Scouts
- `GET /api/v1/scouts` - List scouts
- `POST /api/v1/scouts` - Register scout
- `GET /api/v1/scouts/:id` - Get scout profile
- `PUT /api/v1/scouts/:id` - Update scout

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

### Optional Variables
- `REDIS_URL` - Redis connection for caching
- `SENDGRID_API_KEY` - Email service
- `GOOGLE_CLIENT_ID` - Google OAuth
- `FACEBOOK_APP_ID` - Facebook OAuth

## Database Schema

The database uses PostgreSQL with the following main entities:

- **Users** - Authentication and profile data
- **Troops** - Troop information and settings  
- **Scouts** - Scout profiles and personal data
- **UserTroopRoles** - Role assignments within troops
- **Events** - Meetings, campouts, activities
- **Messages** - Communication system
- **RankAdvancement** - Scout rank progression
- **MeritBadges** - Badge tracking

## Security

- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation with Zod
- JWT token authentication
- CORS configuration
- Environment variable protection

## Testing

Run the test suite:
```bash
npm test
```

For test coverage:
```bash
npm run test:coverage
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Run database migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details