import { supabase } from './config';

/**
 * Create a new entry
 * @param {Object} entryData - { competition_id, competitor_name, category_id, age_division_id, age, dance_type, photo_url }
 * @returns {Object} - Created entry data
 */
export const createEntry = async (entryData) => {
  try {
    console.log('Creating entry:', entryData);
    
    const { data, error } = await supabase
      .from('entries')
      .insert([{
        competition_id: entryData.competition_id,
        entry_number: entryData.entry_number,
        competitor_name: entryData.competitor_name,
        category_id: entryData.category_id || null,
        age_division_id: entryData.age_division_id || null,
        age: entryData.age || null,
        dance_type: entryData.dance_type || null,
        photo_url: entryData.photo_url || null
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Entry created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all entries for a competition
 * @param {string} competitionId - UUID of competition
 * @returns {Array} - List of entries with category and age division info
 */
export const getCompetitionEntries = async (competitionId) => {
  try {
    console.log('Fetching entries for competition:', competitionId);
    
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name),
        age_division:age_divisions(id, name, min_age, max_age)
      `)
      .eq('competition_id', competitionId)
      .order('entry_number');

    if (error) throw error;
    
    console.log('✅ Entries fetched:', data?.length);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching entries:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get entry by ID
 * @param {string} entryId - UUID of entry
 * @returns {Object} - Entry data with related info
 */
export const getEntry = async (entryId) => {
  try {
    console.log('Fetching entry:', entryId);
    
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name),
        age_division:age_divisions(id, name, min_age, max_age)
      `)
      .eq('id', entryId)
      .single();

    if (error) throw error;
    
    console.log('✅ Entry fetched:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get entries by category
 * @param {string} categoryId - UUID of category
 * @returns {Array} - List of entries in category
 */
export const getEntriesByCategory = async (categoryId) => {
  try {
    console.log('Fetching entries for category:', categoryId);
    
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        age_division:age_divisions(id, name)
      `)
      .eq('category_id', categoryId)
      .order('entry_number');

    if (error) throw error;
    
    console.log('✅ Category entries fetched:', data?.length);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching category entries:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get entries by age division
 * @param {string} ageDivisionId - UUID of age division
 * @returns {Array} - List of entries in age division
 */
export const getEntriesByAgeDivision = async (ageDivisionId) => {
  try {
    console.log('Fetching entries for age division:', ageDivisionId);
    
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq('age_division_id', ageDivisionId)
      .order('entry_number');

    if (error) throw error;
    
    console.log('✅ Age division entries fetched:', data?.length);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching age division entries:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update entry
 * @param {string} entryId - UUID of entry
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated entry data
 */
export const updateEntry = async (entryId, updates) => {
  try {
    console.log('Updating entry:', entryId, updates);
    
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Entry updated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete entry
 * @param {string} entryId - UUID of entry
 * @returns {Object} - Success status
 */
export const deleteEntry = async (entryId) => {
  try {
    console.log('Deleting entry:', entryId);
    
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    
    console.log('✅ Entry deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk create entries
 * @param {Array} entriesData - Array of entry objects
 * @returns {Array} - Created entries
 */
export const bulkCreateEntries = async (entriesData) => {
  try {
    console.log('Bulk creating entries:', entriesData.length);
    
    const { data, error } = await supabase
      .from('entries')
      .insert(entriesData)
      .select();

    if (error) throw error;
    
    console.log('✅ Entries bulk created:', data?.length);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error bulk creating entries:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get next available entry number
 * @param {string} competitionId - UUID of competition
 * @returns {number} - Next entry number
 */
export const getNextEntryNumber = async (competitionId) => {
  try {
    console.log('Getting next entry number for competition:', competitionId);
    
    const { data, error } = await supabase
      .from('entries')
      .select('entry_number')
      .eq('competition_id', competitionId)
      .order('entry_number', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    const nextNumber = data && data.length > 0 ? data[0].entry_number + 1 : 1;
    console.log('✅ Next entry number:', nextNumber);
    return { success: true, data: nextNumber };
  } catch (error) {
    console.error('❌ Error getting next entry number:', error);
    return { success: false, error: error.message };
  }
};

