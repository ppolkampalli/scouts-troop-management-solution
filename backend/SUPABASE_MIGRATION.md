# Supabase Migration Guide

This document outlines the migration from Prisma to Supabase for the Scout Troop Management System.

## What Changed

### Dependencies
- **Removed**: `@prisma/client`, `prisma`
- **Added**: `@supabase/supabase-js`

### Configuration
- **Database Connection**: Now uses Supabase client instead of Prisma
- **Environment Variables**: Updated to use Supabase URLs and keys
- **Types**: Generated TypeScript types for Supabase database schema

## Setup Instructions

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from the API settings

### 2. Set up Database Schema
1. Copy the contents of `supabase-migration.sql`
2. Go to your Supabase dashboard → SQL Editor
3. Paste and run the migration script

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Update the Supabase configuration:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed the Database (Optional)
```bash
npm run db:seed
```

## Database Schema

The Supabase schema includes:

### Tables
- `users` - User accounts and profiles
- `troops` - Scout troops
- `user_troop_roles` - User-to-troop role assignments
- `scouts` - Scout profiles
- `rank_advancements` - Scout rank progression
- `merit_badges` - Available merit badges
- `scout_merit_badges` - Scout merit badge progress
- `events` - Troop events and activities
- `event_rsvps` - Event attendance tracking
- `messages` - Internal messaging system

### Enums
- `troop_status` - Active, Inactive, Archived
- `user_role` - Scoutmaster, Parent, Committee Member, etc.
- `gender` - Male, Female
- `scout_rank` - Scout ranks from Scout to Eagle
- `event_type` - Meeting, Campout, Service Project, etc.
- `rsvp_status` - Pending, Attending, Not Attending, Maybe
- `message_type` - General, Announcement, Emergency, etc.
- `priority` - Low, Normal, High, Urgent

### Features
- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamps** with triggers
- **Proper indexes** for performance
- **Foreign key constraints** for data integrity

## Code Changes

### Database Access
Instead of Prisma's generated client, we now use Supabase's client:

```typescript
// Before (Prisma)
import prisma from '../config/database';
const users = await prisma.user.findMany();

// After (Supabase)
import supabase from '../config/database';
const { data: users } = await supabase.from('users').select('*');
```

### Service Layer
New service classes provide abstraction over Supabase operations:
- `UserService` - User management operations
- `TroopService` - Troop management operations

### Type Safety
Database types are generated and imported:
```typescript
import { Database } from '../types/database';
type User = Database['public']['Tables']['users']['Row'];
```

## Migration Benefits

1. **Managed Database**: No need to manage PostgreSQL instance
2. **Real-time Features**: Built-in real-time subscriptions
3. **Authentication**: Integrated auth system (optional to use)
4. **Storage**: Built-in file storage
5. **Auto-generated APIs**: Instant REST and GraphQL APIs
6. **Dashboard**: Web-based database management
7. **Scaling**: Automatic scaling and backups

## Testing

The migration includes sample data seeding with:
- Admin user: `admin@scouttroop.com` (password: `admin123`)
- Parent user: `parent@example.com` (password: `parent123`)
- Sample troop, scout, and event data
- Merit badge catalog

Run the seed script to populate test data:
```bash
npm run db:seed
```

## Row Level Security (RLS)

Basic RLS policies are included but may need customization based on your authentication strategy:

- Users can view/update their own profiles
- Troop members can view troop data
- Additional policies needed for specific access patterns

## Next Steps

1. **Authentication Integration**: Decide whether to use Supabase Auth or continue with your current JWT strategy
2. **API Updates**: Update existing controllers to use the new service layer
3. **Real-time Features**: Consider adding real-time updates for events, messages, etc.
4. **File Storage**: Migrate file uploads to Supabase Storage if needed
5. **Performance Optimization**: Add indexes and optimize queries based on usage patterns

## Rollback Plan

If needed to rollback:
1. Restore `package.json` dependencies
2. Restore Prisma schema and configuration
3. Update database connection back to Prisma
4. Run `prisma generate` and `prisma migrate deploy`

The original Prisma schema is preserved in this document for reference.