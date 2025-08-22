import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: Array<{
      troopId: string;
      role: string;
    }>;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  roles: Array<{
    troopId: string;
    role: string;
  }>;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  provider?: 'local' | 'google' | 'facebook' | 'apple';
  providerId?: string;
}

export interface CreateTroopData {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  charterOrganization: string;
  meetingSchedule: string;
  meetingLocation: string;
  contactEmail: string;
  contactPhone: string;
  foundedDate: Date;
  troopSizeLimit: number;
}

export interface CreateScoutData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  school: {
    name: string;
    grade: number;
  };
  troopId: string;
  parentId: string;
}

export enum UserRole {
  SCOUTMASTER = 'SCOUTMASTER',
  ASSISTANT_SCOUTMASTER = 'ASSISTANT_SCOUTMASTER',
  COMMITTEE_CHAIR = 'COMMITTEE_CHAIR',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
  PARENT = 'PARENT',
  CHARTERED_ORG_REP = 'CHARTERED_ORG_REP',
  YOUTH_LEADER = 'YOUTH_LEADER',
  ADMIN = 'ADMIN'
}

export enum TroopStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum ScoutRank {
  SCOUT = 'SCOUT',
  TENDERFOOT = 'TENDERFOOT',
  SECOND_CLASS = 'SECOND_CLASS',
  FIRST_CLASS = 'FIRST_CLASS',
  STAR = 'STAR',
  LIFE = 'LIFE',
  EAGLE = 'EAGLE'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}