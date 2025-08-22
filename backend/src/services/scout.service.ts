import supabase from '../config/database';

export class ScoutService {
  // Create a new scout
  static async createScout(scoutData: any): Promise<any> {
    const { data, error } = await supabase
      .from('scouts')
      .insert(scoutData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create scout: ${error.message}`);
    }

    return data;
  }

  // Find scout by ID
  static async findScoutById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('scouts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find scout: ${error.message}`);
    }

    return data;
  }

  // Get scouts by troop ID
  static async getScoutsByTroopId(troopId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('scouts')
      .select('*')
      .eq('troop_id', troopId)
      .order('last_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get scouts by troop: ${error.message}`);
    }

    return data || [];
  }

  // Get scouts by parent ID
  static async getScoutsByParentId(parentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('scouts')
      .select('*')
      .eq('parent_id', parentId)
      .order('last_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get scouts by parent: ${error.message}`);
    }

    return data || [];
  }

  // Update scout
  static async updateScout(id: string, scoutData: any): Promise<any> {
    const { data, error } = await supabase
      .from('scouts')
      .update(scoutData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update scout: ${error.message}`);
    }

    return data;
  }

  // Delete scout
  static async deleteScout(id: string): Promise<void> {
    const { error } = await supabase
      .from('scouts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete scout: ${error.message}`);
    }
  }

  // Get scout with rank history
  static async getScoutWithRankHistory(scoutId: string): Promise<any> {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        rank_advancements(
          *
        )
      `)
      .eq('id', scoutId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get scout with rank history: ${error.message}`);
    }

    return data;
  }

  // Get scout with merit badges
  static async getScoutWithMeritBadges(scoutId: string): Promise<any> {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        scout_merit_badges(
          *,
          merit_badges(
            name,
            description,
            category
          )
        )
      `)
      .eq('id', scoutId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get scout with merit badges: ${error.message}`);
    }

    return data;
  }

  // Add rank advancement
  static async addRankAdvancement(scoutId: string, rankData: any): Promise<any> {
    const { data, error } = await supabase
      .from('rank_advancements')
      .insert({
        scout_id: scoutId,
        ...rankData
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add rank advancement: ${error.message}`);
    }

    // Update scout's current rank
    await this.updateScout(scoutId, { current_rank: rankData.rank });

    return data;
  }

  // Start merit badge progress
  static async startMeritBadge(scoutId: string, badgeId: string, counselor?: string): Promise<any> {
    const { data, error } = await supabase
      .from('scout_merit_badges')
      .insert({
        scout_id: scoutId,
        badge_id: badgeId,
        start_date: new Date().toISOString(),
        counselor
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start merit badge: ${error.message}`);
    }

    return data;
  }

  // Complete merit badge
  static async completeMeritBadge(scoutId: string, badgeId: string): Promise<any> {
    const { data, error } = await supabase
      .from('scout_merit_badges')
      .update({
        completed_date: new Date().toISOString()
      })
      .eq('scout_id', scoutId)
      .eq('badge_id', badgeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete merit badge: ${error.message}`);
    }

    return data;
  }

  // Get merit badges
  static async getAllMeritBadges(): Promise<any[]> {
    const { data, error } = await supabase
      .from('merit_badges')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get merit badges: ${error.message}`);
    }

    return data || [];
  }

  // Get merit badges by category
  static async getMeritBadgesByCategory(category: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('merit_badges')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get merit badges by category: ${error.message}`);
    }

    return data || [];
  }
}