import supabase from '../config/database';

export class TroopService {
  // Create a new troop
  static async createTroop(troopData: any): Promise<any> {
    const { data, error } = await supabase
      .from('troops')
      .insert(troopData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create troop: ${error.message}`);
    }

    return data;
  }

  // Find troop by ID
  static async findTroopById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('troops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find troop: ${error.message}`);
    }

    return data;
  }

  // Get all active troops
  static async getActiveTroops(): Promise<any[]> {
    const { data, error } = await supabase
      .from('troops')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('name');

    if (error) {
      throw new Error(`Failed to get active troops: ${error.message}`);
    }

    return data || [];
  }

  // Update troop
  static async updateTroop(id: string, troopData: any): Promise<any> {
    const { data, error } = await supabase
      .from('troops')
      .update(troopData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update troop: ${error.message}`);
    }

    return data;
  }

  // Get troop with members
  static async getTroopWithMembers(troopId: string): Promise<any> {
    const { data, error } = await supabase
      .from('troops')
      .select(`
        *,
        user_troop_roles(
          role,
          users(
            id,
            email,
            first_name,
            last_name
          )
        ),
        scouts(
          id,
          first_name,
          last_name,
          current_rank
        )
      `)
      .eq('id', troopId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get troop with members: ${error.message}`);
    }

    return data;
  }

  // Get troops for a user
  static async getTroopsForUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('troops')
      .select(`
        *,
        user_troop_roles!inner(
          role,
          user_id
        )
      `)
      .eq('user_troop_roles.user_id', userId)
      .order('name');

    if (error) {
      throw new Error(`Failed to get troops for user: ${error.message}`);
    }

    return data || [];
  }

  // Add user to troop with role
  static async addUserToTroop(userId: string, troopId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('user_troop_roles')
      .insert({
        user_id: userId,
        troop_id: troopId,
        role: role
      });

    if (error) {
      throw new Error(`Failed to add user to troop: ${error.message}`);
    }
  }

  // Remove user from troop
  static async removeUserFromTroop(userId: string, troopId: string, role?: string): Promise<void> {
    let query = supabase
      .from('user_troop_roles')
      .delete()
      .eq('user_id', userId)
      .eq('troop_id', troopId);

    if (role) {
      query = query.eq('role', role);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to remove user from troop: ${error.message}`);
    }
  }

  // Get troop statistics
  static async getTroopStats(troopId: string): Promise<any> {
    const [scoutsResult, eventsResult, usersResult] = await Promise.all([
      supabase
        .from('scouts')
        .select('id, current_rank')
        .eq('troop_id', troopId),
      
      supabase
        .from('events')
        .select('id')
        .eq('troop_id', troopId)
        .gte('start_date', new Date().toISOString()),
      
      supabase
        .from('user_troop_roles')
        .select('role')
        .eq('troop_id', troopId)
    ]);

    if (scoutsResult.error || eventsResult.error || usersResult.error) {
      throw new Error('Failed to get troop statistics');
    }

    const scouts = scoutsResult.data || [];
    const events = eventsResult.data || [];
    const users = usersResult.data || [];

    // Count scouts by rank
    const scoutsByRank = scouts.reduce((acc: any, scout: any) => {
      acc[scout.current_rank] = (acc[scout.current_rank] || 0) + 1;
      return acc;
    }, {});

    // Count users by role
    const usersByRole = users.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      totalScouts: scouts.length,
      totalAdults: users.length,
      upcomingEvents: events.length,
      scoutsByRank,
      usersByRole
    };
  }
}