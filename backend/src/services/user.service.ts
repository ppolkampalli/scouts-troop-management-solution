import supabase from '../config/database';

export class UserService {
  // Create a new user
  static async createUser(userData: any): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  // Find user by ID
  static async findUserById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find user by email: ${error.message}`);
    }

    return data;
  }

  // Update user
  static async updateUser(id: string, userData: any): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Get users by troop ID with their roles
  static async getUsersByTroopId(troopId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_troop_roles!inner(
          role,
          troop_id
        )
      `)
      .eq('user_troop_roles.troop_id', troopId);

    if (error) {
      throw new Error(`Failed to get users by troop: ${error.message}`);
    }

    return data || [];
  }

  // Find user by OAuth provider
  static async findUserByProvider(provider: string, providerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find user by provider: ${error.message}`);
    }

    return data;
  }

  // Get user with their scouts
  static async getUserWithScouts(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        scouts(
          *,
          troops(name)
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get user with scouts: ${error.message}`);
    }

    return data;
  }
}