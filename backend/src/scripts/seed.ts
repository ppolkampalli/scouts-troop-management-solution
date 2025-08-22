import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
dotenv.config();

// Debug environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env['SUPABASE_URL'] ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env['SUPABASE_ANON_KEY'] ? 'Set' : 'Not set');

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables (need service role key for seeding)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create sample merit badges
    console.log('Creating merit badges...');
    const meritBadges = [
      { name: 'Camping', description: 'Learn outdoor camping skills', category: 'Outdoor' },
      { name: 'First Aid', description: 'Learn basic first aid and emergency response', category: 'Safety' },
      { name: 'Swimming', description: 'Learn swimming and water safety', category: 'Sports' },
      { name: 'Cooking', description: 'Learn cooking and meal preparation', category: 'Life Skills' },
      { name: 'Citizenship in the Community', description: 'Learn about civic responsibility', category: 'Citizenship' },
      { name: 'Environmental Science', description: 'Learn about environmental conservation', category: 'Science' },
      { name: 'Personal Fitness', description: 'Learn about physical fitness and health', category: 'Health' },
      { name: 'Communication', description: 'Learn effective communication skills', category: 'Life Skills' },
      { name: 'Family Life', description: 'Learn about family relationships and responsibilities', category: 'Life Skills' },
      { name: 'Personal Management', description: 'Learn personal financial management', category: 'Life Skills' }
    ];

    const { error: badgeError } = await supabase
      .from('merit_badges')
      .insert(meritBadges);

    if (badgeError && badgeError.code !== '23505') { // Ignore unique constraint violations
      throw badgeError;
    }

    // Create sample admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        email: 'admin@scouttroop.com',
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword,
        email_verified: true,
        background_check_status: 'APPROVED',
        background_check_date: new Date().toISOString(),
        youth_protection_date: new Date().toISOString()
      })
      .select()
      .single();

    if (adminError && adminError.code !== '23505') { // Ignore if user already exists
      throw adminError;
    }

    if (adminUser) {
      // Create sample troop
      console.log('Creating sample troop...');
      const { data: troop, error: troopError } = await supabase
        .from('troops')
        .insert({
          name: 'Troop 123',
          description: 'Sample Scout Troop for demonstration',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345'
          },
          charter_organization: 'Sample Charter Organization',
          meeting_schedule: 'Mondays 7:00 PM',
          meeting_location: 'Community Center',
          contact_email: 'contact@troop123.com',
          contact_phone: '555-123-4567',
          founded_date: new Date('2020-01-01').toISOString(),
          created_by_id: adminUser.id
        })
        .select()
        .single();

      if (troopError && troopError.code !== '23505') {
        throw troopError;
      }

      if (troop) {
        // Add admin as Scoutmaster
        console.log('Adding admin as Scoutmaster...');
        const { error: roleError } = await supabase
          .from('user_troop_roles')
          .insert({
            user_id: adminUser.id,
            troop_id: troop.id,
            role: 'SCOUTMASTER'
          });

        if (roleError && roleError.code !== '23505') {
          throw roleError;
        }

        // Create sample parent user
        console.log('Creating sample parent...');
        const parentPassword = await bcrypt.hash('parent123', 12);
        
        const { data: parentUser, error: parentError } = await supabase
          .from('users')
          .insert({
            email: 'parent@example.com',
            first_name: 'John',
            last_name: 'Parent',
            password: parentPassword,
            email_verified: true,
            phone: '555-987-6543'
          })
          .select()
          .single();

        if (parentError && parentError.code !== '23505') {
          throw parentError;
        }

        if (parentUser) {
          // Add parent to troop
          const { error: parentRoleError } = await supabase
            .from('user_troop_roles')
            .insert({
              user_id: parentUser.id,
              troop_id: troop.id,
              role: 'PARENT'
            });

          if (parentRoleError && parentRoleError.code !== '23505') {
            throw parentRoleError;
          }

          // Create sample scout
          console.log('Creating sample scout...');
          const { data: scout, error: scoutError } = await supabase
            .from('scouts')
            .insert({
              first_name: 'Alex',
              last_name: 'Scout',
              date_of_birth: new Date('2010-05-15').toISOString(),
              gender: 'MALE',
              address: {
                street: '456 Oak Ave',
                city: 'Anytown',
                state: 'CA',
                zipCode: '12345'
              },
              school: {
                name: 'Anytown Middle School',
                grade: '8'
              },
              emergency_contacts: [
                {
                  name: 'John Parent',
                  relationship: 'Father',
                  phone: '555-987-6543',
                  email: 'parent@example.com'
                }
              ],
              photo_consent: true,
              current_rank: 'SCOUT',
              troop_id: troop.id,
              parent_id: parentUser.id
            })
            .select()
            .single();

          if (scoutError && scoutError.code !== '23505') {
            throw scoutError;
          }

          if (scout) {
            // Create rank advancement record
            const { error: rankError } = await supabase
              .from('rank_advancements')
              .insert({
                scout_id: scout.id,
                rank: 'SCOUT',
                awarded_date: new Date().toISOString(),
                board_date: new Date().toISOString(),
                board_members: ['Admin User', 'Assistant Leader']
              });

            if (rankError && rankError.code !== '23505') {
              throw rankError;
            }
          }
        }

        // Create sample event
        console.log('Creating sample event...');
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            title: 'Weekly Troop Meeting',
            description: 'Regular weekly meeting with activities and advancement',
            type: 'MEETING',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
            location: 'Community Center',
            requires_rsvp: true,
            troop_id: troop.id
          });

        if (eventError && eventError.code !== '23505') {
          throw eventError;
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Admin user: admin@scouttroop.com (password: admin123)');
    console.log('📧 Parent user: parent@example.com (password: parent123)');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();