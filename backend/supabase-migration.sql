-- Supabase Migration Script for Scout Troop Management System
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE troop_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE user_role AS ENUM ('SCOUTMASTER', 'ASSISTANT_SCOUTMASTER', 'COMMITTEE_CHAIR', 'COMMITTEE_MEMBER', 'PARENT', 'CHARTERED_ORG_REP', 'YOUTH_LEADER', 'ADMIN');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE scout_rank AS ENUM ('SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE');
CREATE TYPE event_type AS ENUM ('MEETING', 'CAMPOUT', 'SERVICE_PROJECT', 'COURT_OF_HONOR', 'FUNDRAISER', 'TRAINING', 'OTHER');
CREATE TYPE rsvp_status AS ENUM ('PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE');
CREATE TYPE message_type AS ENUM ('GENERAL', 'ANNOUNCEMENT', 'EMERGENCY', 'EVENT_REMINDER', 'PERMISSION_SLIP');
CREATE TYPE priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    address JSONB,
    background_check_status VARCHAR(50),
    background_check_date TIMESTAMPTZ,
    youth_protection_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Troops table
CREATE TABLE troops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address JSONB NOT NULL,
    charter_organization VARCHAR(255) NOT NULL,
    meeting_schedule VARCHAR(255) NOT NULL,
    meeting_location VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status troop_status DEFAULT 'ACTIVE',
    founded_date TIMESTAMPTZ NOT NULL,
    troop_size_limit INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_id UUID NOT NULL REFERENCES users(id)
);

-- User Troop Roles table
CREATE TABLE user_troop_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    troop_id UUID NOT NULL REFERENCES troops(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, troop_id, role)
);

-- Scouts table
CREATE TABLE scouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth TIMESTAMPTZ NOT NULL,
    gender gender NOT NULL,
    address JSONB NOT NULL,
    school JSONB NOT NULL,
    medical_info JSONB,
    emergency_contacts JSONB NOT NULL,
    photo_consent BOOLEAN DEFAULT false,
    photo_url VARCHAR(500),
    current_rank scout_rank DEFAULT 'SCOUT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    troop_id UUID NOT NULL REFERENCES troops(id),
    parent_id UUID NOT NULL REFERENCES users(id)
);

-- Rank Advancements table
CREATE TABLE rank_advancements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    rank scout_rank NOT NULL,
    awarded_date TIMESTAMPTZ NOT NULL,
    board_date TIMESTAMPTZ,
    board_members JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merit Badges table
CREATE TABLE merit_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scout Merit Badges table
CREATE TABLE scout_merit_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES merit_badges(id),
    start_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    counselor VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scout_id, badge_id)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type event_type NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255),
    max_capacity INTEGER,
    cost DECIMAL(10,2) DEFAULT 0,
    rsvp_deadline TIMESTAMPTZ,
    requires_rsvp BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    troop_id UUID NOT NULL REFERENCES troops(id)
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    scout_id UUID REFERENCES scouts(id),
    status rsvp_status DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id),
    UNIQUE(event_id, scout_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type message_type DEFAULT 'GENERAL',
    priority priority DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sender_id UUID NOT NULL REFERENCES users(id),
    troop_id UUID NOT NULL REFERENCES troops(id),
    recipient_id UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_troops_status ON troops(status);
CREATE INDEX idx_user_troop_roles_user ON user_troop_roles(user_id);
CREATE INDEX idx_user_troop_roles_troop ON user_troop_roles(troop_id);
CREATE INDEX idx_scouts_troop ON scouts(troop_id);
CREATE INDEX idx_scouts_parent ON scouts(parent_id);
CREATE INDEX idx_rank_advancements_scout ON rank_advancements(scout_id);
CREATE INDEX idx_scout_merit_badges_scout ON scout_merit_badges(scout_id);
CREATE INDEX idx_scout_merit_badges_badge ON scout_merit_badges(badge_id);
CREATE INDEX idx_events_troop ON events(troop_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_messages_troop ON messages(troop_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_troops_updated_at BEFORE UPDATE ON troops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_troop_roles_updated_at BEFORE UPDATE ON user_troop_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scouts_updated_at BEFORE UPDATE ON scouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rank_advancements_updated_at BEFORE UPDATE ON rank_advancements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merit_badges_updated_at BEFORE UPDATE ON merit_badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scout_merit_badges_updated_at BEFORE UPDATE ON scout_merit_badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE troops ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_troop_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_advancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE merit_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_merit_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to customize these based on your authentication setup)
-- Users can read their own data
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Troop members can view troop data
CREATE POLICY "Troop members can view troop data" ON troops FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM user_troop_roles 
    WHERE user_id = auth.uid() AND troop_id = troops.id
));

-- Add more policies as needed based on your authorization requirements