import { supabase } from './config';

/**
 * Get admin filters for a competition
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Filter data or null
 */
export const getAdminFilters = async (competitionId) => {
  try {
    console.log('📋 Fetching admin filters for competition:', competitionId);
    
    const { data, error } = await supabase
      .from('admin_filters')
      .select('*')
      .eq('competition_id', competitionId)
      .single();

    if (error) {
      // If no filters exist yet, return default (all filters = 'all')
      if (error.code === 'PGRST116') {
        console.log('📋 No admin filters found, returning defaults');
        return { 
          success: true, 
          data: {
            category_filter: null,
            division_type_filter: 'all',
            age_division_filter: null,
            ability_filter: 'all'
          }
        };
      }
      throw error;
    }

    console.log('✅ Admin filters fetched:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching admin filters:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update admin filters for a competition
 * @param {string} competitionId - UUID of competition
 * @param {Object} filters - Filter values to update
 * @returns {Object} - Success status
 */
export const updateAdminFilters = async (competitionId, filters) => {
  try {
    console.log('📝 Updating admin filters:', { competitionId, filters });
    
    const filterData = {
      competition_id: competitionId,
      category_filter: filters.category_filter || null,
      division_type_filter: filters.division_type_filter || 'all',
      age_division_filter: filters.age_division_filter || null,
      ability_filter: filters.ability_filter || 'all',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('admin_filters')
      .upsert(filterData, {
        onConflict: 'competition_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Admin filters updated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating admin filters:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all admin filters (set all to 'all')
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Success status
 */
export const clearAdminFilters = async (competitionId) => {
  try {
    console.log('🗑️ Clearing admin filters for competition:', competitionId);
    
    const filterData = {
      competition_id: competitionId,
      category_filter: null,
      division_type_filter: 'all',
      age_division_filter: null,
      ability_filter: 'all',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('admin_filters')
      .upsert(filterData, {
        onConflict: 'competition_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Admin filters cleared:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error clearing admin filters:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to admin filter changes (real-time)
 * @param {string} competitionId - UUID of competition
 * @param {Function} callback - Callback function when filters change
 * @returns {Object} - Channel subscription
 */
export const subscribeToAdminFilters = (competitionId, callback) => {
  console.log('🔔 Subscribing to admin filter changes for competition:', competitionId);
  
  const channel = supabase
    .channel(`admin_filters_${competitionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_filters',
        filter: `competition_id=eq.${competitionId}`
      },
      (payload) => {
        console.log('🔔 Admin filter change detected:', payload);
        callback(payload.new || payload.old);
      }
    )
    .subscribe();

  return channel;
};

