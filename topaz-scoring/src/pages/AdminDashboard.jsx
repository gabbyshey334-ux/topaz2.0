import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { getCompetition } from '../supabase/competitions';
import { getCompetitionCategories } from '../supabase/categories';
import { getCompetitionAgeDivisions } from '../supabase/ageDivisions';
import { getCompetitionEntries } from '../supabase/entries';
import { getAdminFilters, updateAdminFilters, clearAdminFilters, subscribeToAdminFilters } from '../supabase/adminFilters';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { competitionId } = location.state || {};

  // State
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ageDivisions, setAgeDivisions] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin filter state
  const [adminFilters, setAdminFilters] = useState({
    category_filter: null,
    division_type_filter: 'all',
    age_division_filter: null,
    ability_filter: 'all'
  });
  
  const [saving, setSaving] = useState(false);

  // Redirect if no competitionId
  useEffect(() => {
    if (!competitionId) {
      toast.error('No competition selected');
      navigate('/');
    }
  }, [competitionId, navigate]);

  // Load competition data
  useEffect(() => {
    const loadData = async () => {
      if (!competitionId) return;

      try {
        setLoading(true);
        const [compResult, catsResult, divsResult, entriesResult, filtersResult] = await Promise.all([
          getCompetition(competitionId),
          getCompetitionCategories(competitionId),
          getCompetitionAgeDivisions(competitionId),
          getCompetitionEntries(competitionId),
          getAdminFilters(competitionId)
        ]);

        if (!compResult.success) throw new Error(compResult.error);

        setCompetition(compResult.data);
        setCategories(catsResult.success ? catsResult.data : []);
        setAgeDivisions(divsResult.success ? divsResult.data : []);
        setAllEntries(entriesResult.success ? entriesResult.data : []);
        
        if (filtersResult.success && filtersResult.data) {
          setAdminFilters({
            category_filter: filtersResult.data.category_filter || null,
            division_type_filter: filtersResult.data.division_type_filter || 'all',
            age_division_filter: filtersResult.data.age_division_filter || null,
            ability_filter: filtersResult.data.ability_filter || 'all'
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
        toast.error(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, [competitionId]);

  // Subscribe to filter changes (for real-time updates from other admins)
  useEffect(() => {
    if (!competitionId) return;

    const channel = subscribeToAdminFilters(competitionId, (newFilters) => {
      console.log('🔔 Admin filters updated by another admin:', newFilters);
      setAdminFilters({
        category_filter: newFilters.category_filter || null,
        division_type_filter: newFilters.division_type_filter || 'all',
        age_division_filter: newFilters.age_division_filter || null,
        ability_filter: newFilters.ability_filter || 'all'
      });
      toast.info('Filters updated by another admin', { autoClose: 2000 });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [competitionId]);

  // Calculate filtered entries (preview what judges see)
  const filteredEntries = (() => {
    let filtered = [...allEntries];

    // Filter by category
    if (adminFilters.category_filter) {
      filtered = filtered.filter(e => e.category_id === adminFilters.category_filter);
    }

    // Filter by division type
    if (adminFilters.division_type_filter && adminFilters.division_type_filter !== 'all') {
      filtered = filtered.filter(e => {
        const entryType = e.dance_type || '';
        const filterType = adminFilters.division_type_filter;
        
        // Normalize comparison
        const normalizedEntry = entryType.toLowerCase().replace(/[_\s()]/g, '');
        const normalizedFilter = filterType.toLowerCase().replace(/[_\s()]/g, '');
        
        if (normalizedFilter.includes('smallgroup')) return normalizedEntry.includes('smallgroup');
        if (normalizedFilter.includes('largegroup')) return normalizedEntry.includes('largegroup');
        if (normalizedFilter.includes('duo')) return normalizedEntry.includes('duo') && !normalizedEntry.includes('trio');
        if (normalizedFilter.includes('trio')) return normalizedEntry.includes('trio');
        if (normalizedFilter.includes('solo')) return normalizedEntry.includes('solo') || (!normalizedEntry.includes('group') && !normalizedEntry.includes('duo') && !normalizedEntry.includes('trio'));
        
        return normalizedEntry.includes(normalizedFilter);
      });
    }

    // Filter by age division
    if (adminFilters.age_division_filter) {
      filtered = filtered.filter(e => e.age_division_id === adminFilters.age_division_filter);
    }

    // Filter by ability level
    if (adminFilters.ability_filter && adminFilters.ability_filter !== 'all') {
      filtered = filtered.filter(e => e.ability_level === adminFilters.ability_filter);
    }

    return filtered;
  })();

  // Update a single filter
  const handleFilterChange = async (filterType, value) => {
    const newFilters = {
      ...adminFilters,
      [filterType]: value === 'all' ? null : value
    };
    
    // Special handling for division_type and ability (they use 'all' string)
    if (filterType === 'division_type_filter' || filterType === 'ability_filter') {
      newFilters[filterType] = value;
    }

    setAdminFilters(newFilters);

    // Save to database
    setSaving(true);
    try {
      const result = await updateAdminFilters(competitionId, newFilters);
      if (result.success) {
        toast.success('Filters updated! All judges will see the new filter settings.', { autoClose: 2000 });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating filters:', error);
      toast.error(`Failed to update filters: ${error.message}`);
      // Revert on error
      setAdminFilters(adminFilters);
    } finally {
      setSaving(false);
    }
  };

  // Clear all filters
  const handleClearFilters = async () => {
    if (!window.confirm('Clear all filters? This will show all entries to all judges.')) {
      return;
    }

    setSaving(true);
    try {
      const result = await clearAdminFilters(competitionId);
      if (result.success) {
        setAdminFilters({
          category_filter: null,
          division_type_filter: 'all',
          age_division_filter: null,
          ability_filter: 'all'
        });
        toast.success('All filters cleared! All judges will see all entries.', { autoClose: 2000 });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast.error(`Failed to clear filters: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout overlayOpacity="bg-white/80">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!competition) {
    return (
      <Layout overlayOpacity="bg-white/80">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Competition not found</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout overlayOpacity="bg-white/90">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/results', { state: { competitionId } })}
            className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-semibold flex items-center min-h-[44px]"
          >
            ← Back to Results
          </button>

          <div className="text-center flex-1 px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              🎛️ Admin Control Panel
            </h1>
            <p className="text-teal-600 font-semibold text-sm sm:text-base">
              {competition.name}
            </p>
          </div>

          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-blue-800 mb-2">ℹ️ How This Works</h3>
          <p className="text-sm text-blue-700">
            These filters control what <strong>ALL judges</strong> see on their scoring screens. 
            Changes apply immediately and update all judge screens in real-time. 
            Judges cannot change these filters themselves.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Filter Controls for All Judges</h2>
            <button
              onClick={handleClearFilters}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Category
              </label>
              <select
                value={adminFilters.category_filter || 'all'}
                onChange={(e) => handleFilterChange('category_filter', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Division Type Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Division Type
              </label>
              <select
                value={adminFilters.division_type_filter || 'all'}
                onChange={(e) => handleFilterChange('division_type_filter', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50"
              >
                <option value="all">All Division Types</option>
                <option value="Solo">Solo</option>
                <option value="Duo">Duo</option>
                <option value="Trio">Trio</option>
                <option value="Small Group">Small Group</option>
                <option value="Large Group">Large Group</option>
                <option value="Production">Production</option>
                <option value="Student Choreography">Student Choreography</option>
                <option value="Teacher/Student">Teacher/Student</option>
              </select>
            </div>

            {/* Age Division Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Age Division
              </label>
              <select
                value={adminFilters.age_division_filter || 'all'}
                onChange={(e) => handleFilterChange('age_division_filter', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50"
              >
                <option value="all">All Ages</option>
                {ageDivisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.name} ({div.min_age}-{div.max_age === 99 ? '13+' : div.max_age})
                  </option>
                ))}
              </select>
            </div>

            {/* Ability Level Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Ability Level
              </label>
              <select
                value={adminFilters.ability_filter || 'all'}
                onChange={(e) => handleFilterChange('ability_filter', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50"
              >
                <option value="all">All Levels</option>
                <option value="Beginning">Beginning</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {saving && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-teal-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent"></div>
                <span className="text-sm font-semibold">Updating filters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current View (What Judges See)</h2>
          
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-teal-800">
                  Showing {filteredEntries.length} of {allEntries.length} entries
                </p>
                <p className="text-sm text-teal-700 mt-1">
                  All judges will see these {filteredEntries.length} entries on their scoring screens
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Entry List Preview */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 text-lg">No entries match the current filters</p>
              <p className="text-gray-500 text-sm mt-2">Judges will see an empty list</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredEntries.slice(0, 50).map(entry => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        Entry #{entry.entry_number}: {entry.competitor_name}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        {categories.find(c => c.id === entry.category_id)?.name || 'Unknown'} • 
                        {entry.dance_type || 'Solo'} • 
                        {entry.ability_level || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredEntries.length > 50 && (
                  <div className="text-center text-gray-500 text-sm py-2">
                    ... and {filteredEntries.length - 50} more entries
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;

