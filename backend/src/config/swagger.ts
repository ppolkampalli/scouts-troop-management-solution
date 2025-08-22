import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scout Troop Management API',
      version: '1.0.0',
      description: `
        A comprehensive REST API for managing Boy Scout troops, members, and activities.
        
        ## Features
        - User authentication and authorization
        - Troop management and member roster
        - Scout advancement tracking
        - Merit badge progress monitoring
        - Event management and RSVP tracking
        - Background check and training status
        
        ## Authentication
        This API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`
        
        ## Getting Started
        1. Register a new user account or login with existing credentials
        2. Create or join a troop
        3. Add scouts and track their advancement
        4. Manage events and activities
      `,
      contact: {
        name: 'Scout Troop Management System',
        email: 'support@scouttroop.local'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development server'
      },
      {
        url: `https://api.scouttroop.com/api/${env.API_VERSION}`,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Access token required' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access forbidden - insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Insufficient permissions' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Validation error' },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string', example: 'body.email' },
                        message: { type: 'string', example: 'Invalid email format' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Internal server error' }
                }
              }
            }
          }
        }
      },
      schemas: {
        // Standard API Response
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            error: { type: 'string' }
          }
        },

        // User-related schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '3bd13a62-dcd9-43f0-a535-42a27fe25b2a' },
            email: { type: 'string', format: 'email', example: 'admin@scouttroop.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Smith' },
            provider: { type: 'string', enum: ['local', 'google', 'facebook', 'apple'], example: 'local' },
            provider_id: { type: 'string', nullable: true },
            email_verified: { type: 'boolean', example: true },
            phone: { type: 'string', nullable: true, example: '555-123-4567' },
            address: {
              type: 'object',
              nullable: true,
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Anytown' },
                state: { type: 'string', example: 'CA' },
                zipCode: { type: 'string', example: '12345' }
              }
            },
            background_check_status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'DENIED', 'EXPIRED'],
              nullable: true,
              example: 'APPROVED'
            },
            background_check_date: { type: 'string', format: 'date-time', nullable: true },
            youth_protection_date: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        UserRegistration: {
          type: 'object',
          required: ['email', 'firstName', 'lastName', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Smith' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            phone: { type: 'string', example: '555-123-4567' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Anytown' },
                state: { type: 'string', example: 'CA' },
                zipCode: { type: 'string', example: '12345' }
              }
            }
          }
        },

        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@scouttroop.com' },
            password: { type: 'string', example: 'admin123' }
          }
        },

        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },

        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: { $ref: '#/components/schemas/AuthTokens' }
              }
            }
          }
        },

        // Troop-related schemas
        Troop: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '26832f33-d041-49ad-90ba-487aeb43c0aa' },
            name: { type: 'string', example: 'Troop 123' },
            description: { type: 'string', nullable: true, example: 'Sample Scout Troop for demonstration' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Anytown' },
                state: { type: 'string', example: 'CA' },
                zipCode: { type: 'string', example: '12345' }
              }
            },
            charter_organization: { type: 'string', example: 'Sample Charter Organization' },
            meeting_schedule: { type: 'string', example: 'Mondays 7:00 PM' },
            meeting_location: { type: 'string', example: 'Community Center' },
            contact_email: { type: 'string', format: 'email', example: 'contact@troop123.com' },
            contact_phone: { type: 'string', example: '555-123-4567' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], example: 'ACTIVE' },
            founded_date: { type: 'string', format: 'date-time' },
            troop_size_limit: { type: 'integer', example: 100 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            created_by_id: { type: 'string', format: 'uuid' }
          }
        },

        CreateTroopRequest: {
          type: 'object',
          required: ['name', 'address', 'charterOrganization', 'meetingSchedule', 'meetingLocation', 'contactEmail', 'contactPhone'],
          properties: {
            name: { type: 'string', example: 'Troop 456' },
            description: { type: 'string', example: 'A great scout troop' },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'zipCode'],
              properties: {
                street: { type: 'string', example: '456 Oak Ave' },
                city: { type: 'string', example: 'Springfield' },
                state: { type: 'string', example: 'IL' },
                zipCode: { type: 'string', example: '62704' }
              }
            },
            charterOrganization: { type: 'string', example: 'First Methodist Church' },
            meetingSchedule: { type: 'string', example: 'Tuesdays 7:00 PM' },
            meetingLocation: { type: 'string', example: 'Church Fellowship Hall' },
            contactEmail: { type: 'string', format: 'email', example: 'contact@troop456.org' },
            contactPhone: { type: 'string', example: '555-987-6543' },
            foundedDate: { type: 'string', format: 'date', example: '2020-09-01' },
            troopSizeLimit: { type: 'integer', minimum: 1, example: 50 }
          }
        },

        TroopStats: {
          type: 'object',
          properties: {
            totalScouts: { type: 'integer', example: 15 },
            totalAdults: { type: 'integer', example: 8 },
            upcomingEvents: { type: 'integer', example: 3 },
            scoutsByRank: {
              type: 'object',
              example: {
                'SCOUT': 5,
                'TENDERFOOT': 3,
                'SECOND_CLASS': 2,
                'FIRST_CLASS': 3,
                'STAR': 1,
                'LIFE': 1,
                'EAGLE': 0
              }
            },
            usersByRole: {
              type: 'object',
              example: {
                'SCOUTMASTER': 1,
                'ASSISTANT_SCOUTMASTER': 2,
                'COMMITTEE_CHAIR': 1,
                'COMMITTEE_MEMBER': 3,
                'PARENT': 12
              }
            }
          }
        },

        // Scout-related schemas
        Scout: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '50975c28-7501-4545-8589-979dc45e9eef' },
            first_name: { type: 'string', example: 'Alex' },
            last_name: { type: 'string', example: 'Scout' },
            date_of_birth: { type: 'string', format: 'date-time' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '456 Oak Ave' },
                city: { type: 'string', example: 'Anytown' },
                state: { type: 'string', example: 'CA' },
                zipCode: { type: 'string', example: '12345' }
              }
            },
            school: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Anytown Middle School' },
                grade: { type: 'string', example: '8' }
              }
            },
            emergency_contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Parent' },
                  relationship: { type: 'string', example: 'Father' },
                  phone: { type: 'string', example: '555-987-6543' },
                  email: { type: 'string', format: 'email', example: 'parent@example.com' }
                }
              }
            },
            medical_info: {
              type: 'object',
              nullable: true,
              properties: {
                allergies: { type: 'array', items: { type: 'string' } },
                medications: { type: 'array', items: { type: 'string' } },
                conditions: { type: 'array', items: { type: 'string' } }
              }
            },
            photo_consent: { type: 'boolean', example: true },
            photo_url: { type: 'string', format: 'uri', nullable: true },
            current_rank: { 
              type: 'string', 
              enum: ['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE'],
              example: 'SCOUT'
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            troop_id: { type: 'string', format: 'uuid' },
            parent_id: { type: 'string', format: 'uuid' }
          }
        },

        CreateScoutRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'address', 'school', 'emergencyContacts', 'troopId', 'parentId'],
          properties: {
            firstName: { type: 'string', example: 'Alex' },
            lastName: { type: 'string', example: 'Smith' },
            dateOfBirth: { type: 'string', format: 'date', example: '2010-05-15' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'zipCode'],
              properties: {
                street: { type: 'string', example: '456 Oak Ave' },
                city: { type: 'string', example: 'Anytown' },
                state: { type: 'string', example: 'CA' },
                zipCode: { type: 'string', example: '12345' }
              }
            },
            school: {
              type: 'object',
              required: ['name', 'grade'],
              properties: {
                name: { type: 'string', example: 'Anytown Middle School' },
                grade: { type: 'string', example: '8' }
              }
            },
            emergencyContacts: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['name', 'relationship', 'phone'],
                properties: {
                  name: { type: 'string', example: 'John Parent' },
                  relationship: { type: 'string', example: 'Father' },
                  phone: { type: 'string', example: '555-987-6543' },
                  email: { type: 'string', format: 'email', example: 'parent@example.com' }
                }
              }
            },
            medicalInfo: {
              type: 'object',
              properties: {
                allergies: { type: 'array', items: { type: 'string' } },
                medications: { type: 'array', items: { type: 'string' } },
                conditions: { type: 'array', items: { type: 'string' } }
              }
            },
            photoConsent: { type: 'boolean', default: false },
            photoUrl: { type: 'string', format: 'uri' },
            currentRank: { 
              type: 'string', 
              enum: ['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE'],
              default: 'SCOUT'
            },
            troopId: { type: 'string', format: 'uuid' },
            parentId: { type: 'string', format: 'uuid' }
          }
        },

        // Merit Badge schemas
        MeritBadge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'e545513f-bfe3-4fb2-ad9b-091b235539e2' },
            name: { type: 'string', example: 'Camping' },
            description: { type: 'string', example: 'Learn outdoor camping skills' },
            category: { type: 'string', example: 'Outdoor' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        // Rank Advancement schemas
        RankAdvancement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            scout_id: { type: 'string', format: 'uuid' },
            rank: { 
              type: 'string', 
              enum: ['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE'],
              example: 'TENDERFOOT'
            },
            awarded_date: { type: 'string', format: 'date-time' },
            board_date: { type: 'string', format: 'date-time', nullable: true },
            board_members: { 
              type: 'array', 
              items: { type: 'string' },
              nullable: true,
              example: ['John Smith', 'Jane Doe']
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        AddRankAdvancementRequest: {
          type: 'object',
          required: ['rank', 'awardedDate'],
          properties: {
            rank: { 
              type: 'string', 
              enum: ['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE']
            },
            awardedDate: { type: 'string', format: 'date' },
            boardDate: { type: 'string', format: 'date' },
            boardMembers: { 
              type: 'array', 
              items: { type: 'string' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Troops',
        description: 'Scout troop management operations'
      },
      {
        name: 'Scouts',
        description: 'Scout profile and advancement management'
      },
      {
        name: 'Merit Badges',
        description: 'Merit badge catalog and progress tracking'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const specs = swaggerJsdoc(options);
export default specs;