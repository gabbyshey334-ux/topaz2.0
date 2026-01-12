import { supabase } from './config';

/**
 * Create a new competition
 * @param {Object} competitionData - { name, date, venue, judges_count, status }
 * @returns {Object} - Created competition data
 */
export const createCompetition = async (competitionData) => {
  try {
    console.log('Creating competition:', competitionData);
    
    const { data, error } = await supabase
      .from('competitions')
      .insert([{
        name: competitionData.name,
        date: competitionData.date,
        venue: competitionData.venue || null,
        judges_count: competitionData.judges_count || 3,
        judge_names: competitionData.judge_names || [],
        status: competitionData.status || 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Competition created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating competition:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get competition by ID
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Competition data
 */
export const getCompetition = async (competitionId) => {
  try {
    console.log('Fetching competition:', competitionId);
    
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (error) throw error;
    
    console.log('✅ Competition fetched:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching competition:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all competitions
 * @param {string} status - Filter by status (active/completed/all)
 * @returns {Array} - List of competitions
 */
export const getAllCompetitions = async (status = 'all') => {
  try {
    console.log('Fetching all competitions, status:', status);
    
    let query = supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: false });
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    console.log('✅ Competitions fetched:', data?.length);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching competitions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update competition
 * @param {string} competitionId - UUID of competition
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated competition data
 */
export const updateCompetition = async (competitionId, updates) => {
  try {
    console.log('Updating competition:', competitionId, updates);
    
    const { data, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', competitionId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Competition updated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating competition:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete competition (and all related data)
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Success status
 */
export const deleteCompetition = async (competitionId) => {
  try {
    console.log('Deleting competition:', competitionId);
    
    // Supabase will handle cascade deletes based on foreign key constraints
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (error) throw error;
    
    console.log('✅ Competition deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting competition:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get competition statistics
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Statistics data
 */
export const getCompetitionStats = async (competitionId) => {
  try {
    console.log('Fetching competition stats:', competitionId);
    
    // Get entries count
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('id', { count: 'exact' })
      .eq('competition_id', competitionId);
    
    if (entriesError) throw entriesError;

    // Get scores count
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('id', { count: 'exact' })
      .eq('competition_id', competitionId);
    
    if (scoresError) throw scoresError;

    // Get categories count
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id', { count: 'exact' })
      .eq('competition_id', competitionId);
    
    if (categoriesError) throw categoriesError;

    const stats = {
      total_entries: entries?.length || 0,
      total_scores: scores?.length || 0,
      total_categories: categories?.length || 0
    };
    
    console.log('✅ Stats fetched:', stats);
    return { success: true, data: stats };
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return { success: false, error: error.message };
  }
};

