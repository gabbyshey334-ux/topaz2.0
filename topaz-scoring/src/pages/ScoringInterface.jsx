import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import AbilityBadge from '../components/AbilityBadge';
import { createScore, getEntryScores, updateScore } from '../supabase/scores';
import { validateScore, calculateTotal } from '../utils/calculations';
import { getAdminFilters, subscribeToAdminFilters } from '../supabase/adminFilters';

function ScoringInterface() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    competitionId,
    judgeNumber,
    competition,
    categories = [],
    ageDivisions = [],
    entries: allEntries = []
  } = location.state || {};

  console.log('🎯 ScoringInterface render - State:', { 
    competitionId, 
    judgeNumber, 
    hasCompetition: !!competition,
    categoriesCount: categories.length,
    ageDivisionsCount: ageDivisions.length,
    entriesCount: allEntries.length
  });

  // Logo paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  // State - Entries and Filtering
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentEntry, setCurrentEntry] = useState(null);

  // State - Admin Filters (controlled by admin, not judge)
  const [adminFilters, setAdminFilters] = useState({
    category_filter: null,
    division_type_filter: 'all',
    age_division_filter: null,
    ability_filter: 'all'
  });
  
  // Search query (only filter judges can control)
  const [searchQuery, setSearchQuery] = useState('');

  // State - Scoring Form
  const [technique, setTechnique] = useState('');
  const [creativity, setCreativity] = useState('');
  const [presentation, setPresentation] = useState('');
  const [appearance, setAppearance] = useState('');
  const [notes, setNotes] = useState('');
  const [total, setTotal] = useState(0);

  // State - Tracking
  const [scoredEntries, setScoredEntries] = useState(new Set());
  const [existingScoreId, setExistingScoreId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // State - UI
  const [showEntryList, setShowEntryList] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(false);

  // Load admin filters and subscribe to changes
  useEffect(() => {
    if (!competitionId) return;

    // Load initial admin filters
    const loadFilters = async () => {
      try {
        const result = await getAdminFilters(competitionId);
        if (result.success && result.data) {
          setAdminFilters({
            category_filter: result.data.category_filter || null,
            division_type_filter: result.data.division_type_filter || 'all',
            age_division_filter: result.data.age_division_filter || null,
            ability_filter: result.data.ability_filter || 'all'
          });
        }
      } catch (error) {
        console.error('Error loading admin filters:', error);
      }
    };

    loadFilters();

    // Subscribe to real-time filter changes
    const channel = subscribeToAdminFilters(competitionId, (newFilters) => {
      console.log('🔔 Admin filters updated:', newFilters);
      setAdminFilters({
        category_filter: newFilters.category_filter || null,
        division_type_filter: newFilters.division_type_filter || 'all',
        age_division_filter: newFilters.age_division_filter || null,
        ability_filter: newFilters.ability_filter || 'all'
      });
      toast.info('Filters updated by admin', { autoClose: 2000 });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [competitionId]);

  // Redirect if no data
  useEffect(() => {
    console.log('🔍 ScoringInterface mounted - Checking required data...');
    console.log('📍 Full location state:', location.state);
    console.log('📍 competitionId:', competitionId);
    console.log('📍 judgeNumber:', judgeNumber);
    console.log('📍 competition:', competition);
    console.log('📍 allEntries length:', allEntries?.length);
    
    if (!competitionId || !judgeNumber) {
      console.error('❌ Missing required data:', { competitionId, judgeNumber });
      toast.error('Missing competition data. Please start from Competition Setup.');
      setTimeout(() => {
        console.log('🔄 Redirecting to judge-selection...');
        navigate('/judge-selection', { state: { competitionId } });
      }, 1500);
      return; // Don't set entries if redirecting
    } else {
      console.log('✅ Required data present, setting entries...');
      console.log('📊 Setting', allEntries.length, 'entries');
      setEntries(allEntries);
      setLoading(false);
    }
  }, [competitionId, judgeNumber, allEntries, navigate, location.state]);

  // Debug: Log all unique division types in entries
  useEffect(() => {
    if (entries.length > 0) {
      const uniqueTypes = [...new Set(entries.map(e => {
        const raw = e.dance_type || 'Solo';
        const normalized = getDivisionType(e);
        return `${raw} -> ${normalized}`;
      }))];
      console.log('📊 All unique division types in entries:', uniqueTypes);
    }
  }, [entries]);

  // Filter entries using ADMIN FILTERS (not judge-controlled) + search query
  useEffect(() => {
    let filtered = [...entries];

    // Apply admin category filter
    if (adminFilters.category_filter) {
      filtered = filtered.filter(e => e.category_id === adminFilters.category_filter);
    }

    // Apply admin division type filter
    if (adminFilters.division_type_filter && adminFilters.division_type_filter !== 'all') {
      const filterType = adminFilters.division_type_filter;
      filtered = filtered.filter(e => {
        const entryType = e.dance_type || '';
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

    // Apply admin age division filter
    if (adminFilters.age_division_filter) {
      filtered = filtered.filter(e => e.age_division_id === adminFilters.age_division_filter);
    }

    // Apply admin ability level filter
    if (adminFilters.ability_filter && adminFilters.ability_filter !== 'all') {
      filtered = filtered.filter(e => e.ability_level === adminFilters.ability_filter);
    }

    // Apply search query (only filter judges can control)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.competitor_name.toLowerCase().includes(query) ||
        e.entry_number.toString().includes(query)
      );
    }

    setFilteredEntries(filtered);
    setCurrentIndex(0);
    setCurrentEntry(filtered[0] || null);
  }, [adminFilters, searchQuery, entries]);

  // Auto-calculate total
  useEffect(() => {
    const t = parseFloat(technique) || 0;
    const c = parseFloat(creativity) || 0;
    const p = parseFloat(presentation) || 0;
    const a = parseFloat(appearance) || 0;
    setTotal(t + c + p + a);
  }, [technique, creativity, presentation, appearance]);

  // Load existing score for current entry
  useEffect(() => {
    const loadExistingScore = async () => {
      if (!currentEntry) return;

      try {
        const result = await getEntryScores(currentEntry.id);
        
        if (result.success && result.data) {
          const scores = result.data;
          const judgeScore = scores.find(s => s.judge_number === judgeNumber);

          if (judgeScore) {
            // Load existing scores
            setTechnique(judgeScore.technique.toString());
            setCreativity(judgeScore.creativity.toString());
            setPresentation(judgeScore.presentation.toString());
            setAppearance(judgeScore.appearance.toString());
            setNotes(judgeScore.notes || '');
            setExistingScoreId(judgeScore.id);

            // Mark as scored
            setScoredEntries(prev => new Set([...prev, currentEntry.id]));
          } else {
            // Clear form
            clearForm();
          }
        } else {
          clearForm();
        }
      } catch (error) {
        console.error('Error loading existing score:', error);
        clearForm();
      }
    };

    loadExistingScore();
  }, [currentEntry, judgeNumber]);

  // Clear form
  const clearForm = () => {
    setTechnique('');
    setCreativity('');
    setPresentation('');
    setAppearance('');
    setNotes('');
    setExistingScoreId(null);
  };

  // Validate scores
  const validateScores = () => {
    // Check if all fields have values
    if (!technique || !creativity || !presentation || !appearance) {
      toast.error('Please enter all scores (Technique, Creativity, Presentation, Appearance)');
      return false;
    }

    // Validate each score is in range 0-25
    const errors = [];
    const techValidation = validateScore(technique);
    if (!techValidation.valid) errors.push(`Technique: ${techValidation.error}`);
    
    const creatValidation = validateScore(creativity);
    if (!creatValidation.valid) errors.push(`Creativity: ${creatValidation.error}`);
    
    const presValidation = validateScore(presentation);
    if (!presValidation.valid) errors.push(`Presentation: ${presValidation.error}`);
    
    const appearValidation = validateScore(appearance);
    if (!appearValidation.valid) errors.push(`Appearance: ${appearValidation.error}`);

    if (errors.length > 0) {
      toast.error(`Invalid scores:\n${errors.join('\n')}`);
      return false;
    }

    // Check total doesn't exceed 100
    if (total > 100) {
      toast.error('Total score cannot exceed 100');
      return false;
    }

    return true;
  };

  // Save score to Supabase
  const handleSave = async (moveNext = true) => {
    if (!validateScores()) return false;

    if (!currentEntry) {
      toast.error('No entry selected');
      return false;
    }

    try {
      setSaving(true);

      const scoreData = {
        competition_id: competitionId,
        entry_id: currentEntry.id,
        judge_number: judgeNumber,
        technique: parseFloat(technique),
        creativity: parseFloat(creativity),
        presentation: parseFloat(presentation),
        appearance: parseFloat(appearance),
        total_score: parseFloat(total.toFixed(2)),
        notes: notes.trim() || null
      };

      let result;
      if (existingScoreId) {
        // Update existing score
        result = await updateScore(existingScoreId, scoreData);
      } else {
        // Create new score
        result = await createScore(scoreData);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Score saved!');
      
      // Mark as scored
      setScoredEntries(prev => new Set([...prev, currentEntry.id]));

      // Move to next entry if requested
      if (moveNext) {
        moveToNextEntry();
      }

      setSaving(false);
      return true;
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error(`Failed to save: ${error.message}`);
      setSaving(false);
      return false;
    }
  };

  // Navigation functions
  const moveToNextEntry = () => {
    if (currentIndex < filteredEntries.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentEntry(filteredEntries[currentIndex + 1]);
    }
  };

  const moveToPreviousEntry = async () => {
    // Save current entry first
    const saved = await handleSave(false);
    if (saved && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentEntry(filteredEntries[currentIndex - 1]);
    }
  };

  const jumpToEntry = async (index) => {
    // Save current entry first if scores entered
    if (technique || creativity || presentation || appearance) {
      await handleSave(false);
    }
    setCurrentIndex(index);
    setCurrentEntry(filteredEntries[index]);
    setShowEntryList(false);
  };

  // Handle finish
  const handleFinish = async () => {
    // Save current entry first
    const saved = await handleSave(false);
    if (!saved) return;

    if (window.confirm('Submit all scores and view results?')) {
      navigate('/results', {
        state: {
          competitionId,
          competition,
          categories,
          ageDivisions,
          entries
        }
      });
    }
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  // Get age division name
  const getAgeDivisionName = (divisionId) => {
    const div = ageDivisions.find(d => d.id === divisionId);
    return div ? div.name : null;
  };

  // Calculate progress
  const calculateProgress = () => {
    const scored = filteredEntries.filter(e => scoredEntries.has(e.id)).length;
    const total = filteredEntries.length;
    const percentage = total > 0 ? (scored / total) * 100 : 0;
    return { scored, total, percentage };
  };

  // Get color for total score
  const getTotalColor = () => {
    if (total >= 85) return 'text-green-600';
    if (total >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Parse group members from dance_type field
  const parseGroupMembers = (danceType) => {
    if (!danceType) return [];
    try {
      const match = danceType.match(/Members: (\[.*?\])/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (e) {
      console.error('Error parsing group members:', e);
    }
    return [];
  };

  // Check if entry is a group
  const isGroup = (entry) => {
    return entry.dance_type && entry.dance_type.includes('group');
  };

  /**
   * Get division type from entry - normalizes to standard format
   * Handles variations like:
   * - "Small Group (4-10)" -> "Small Group"
   * - "Large Group (11+)" -> "Large Group"
   * - "Duo/Trio" -> "Duo/Trio"
   * - "Solo" -> "Solo"
   * Also handles pipe-separated values: "Solo | Variety A" -> "Solo"
   */
  const getDivisionType = (entry) => {
    if (!entry.dance_type) return 'Solo';
    
    // Extract division type (before pipe if present)
    let divisionType = entry.dance_type;
    const pipeIndex = divisionType.indexOf('|');
    if (pipeIndex > -1) {
      divisionType = divisionType.substring(0, pipeIndex);
    }
    
    // Remove counts in parentheses: "Small Group (4-10)" -> "Small Group"
    divisionType = divisionType.replace(/\s*\([^)]*\)\s*$/, '');
    
    // Trim whitespace
    divisionType = divisionType.trim();
    
    // Normalize to standard values (case-insensitive matching)
    const lower = divisionType.toLowerCase();
    
    if (lower.includes('small group')) return 'Small Group';
    if (lower.includes('large group')) return 'Large Group';
    if (lower.includes('duo') && !lower.includes('trio')) {
      return 'Duo';
    }
    if (lower.includes('trio')) {
      return 'Trio';
    }
    if (lower.includes('production')) return 'Production';
    if (lower.includes('student choreography')) return 'Student Choreography';
    if (lower.includes('teacher') && lower.includes('student')) return 'Teacher/Student';
    if (lower.includes('solo')) return 'Solo';
    
    // Return as-is if no match (shouldn't happen, but fallback)
    return divisionType || 'Solo';
  };
  
  // Helper function to get category name (for display)
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '';
  };

  if (loading) {
    return (
      <Layout overlayOpacity="bg-white/80">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading entries...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Missing required data - show error and redirect
  if (!competitionId || !judgeNumber || !competition) {
    console.error('🚨 Rendering error screen - Missing data:', {
      hasCompetitionId: !!competitionId,
      hasJudgeNumber: !!judgeNumber,
      hasCompetition: !!competition
    });
    
    return (
      <Layout overlayOpacity="bg-white/80">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Missing Competition Data</h2>
            <p className="text-gray-600 mb-4">
              {!competitionId && "• No competition ID provided. "}
              {!judgeNumber && "• No judge number selected. "}
              {!competition && "• Competition information not loaded. "}
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                💡 How to fix this:
              </p>
              <p className="text-sm text-yellow-700">
                1. Start from the Welcome page<br/>
                2. Create a new competition<br/>
                3. Select a judge to begin scoring
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  console.log('🏠 Navigating to home...');
                  navigate('/');
                }}
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                🏠 Back to Home
              </button>
              {competitionId && (
                <button
                  onClick={() => {
                    console.log('🔙 Navigating back to judge selection with ID:', competitionId);
                    navigate('/judge-selection', { state: { competitionId } });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back to Judge Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentEntry) {
    return (
      <Layout overlayOpacity="bg-white/80">
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon="🎭"
            title="No Entries to Score"
            description="No entries match the current filters. Try adjusting your category or age division filters."
            action={{
              label: "Back to Judge Selection",
              onClick: () => navigate('/judge-selection', { state: { competitionId } })
            }}
          />
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress();
  const groupMembers = isGroup(currentEntry) ? parseGroupMembers(currentEntry.dance_type) : [];

  return (
    <Layout overlayOpacity="bg-white/90">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/judge-selection', { state: { competitionId } })}
            className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-semibold flex items-center min-h-[44px]"
          >
            ← Back
          </button>

          <div className="text-center flex-1 px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {competition?.name}
            </h1>
            <p className="text-teal-600 font-semibold text-sm sm:text-base">
              {competition?.judge_names?.[judgeNumber - 1] || `Judge ${judgeNumber}`} Scoring
            </p>
          </div>

          <span className="text-teal-600 font-semibold text-sm sm:text-base whitespace-nowrap">
            Step 3 / 3
          </span>
        </div>

        {/* FILTER & PROGRESS SECTION */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6">
          {/* Admin Filter Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎛️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">
                  Filters are controlled by Admin
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  The entries you see are filtered by the competition administrator. 
                  Changes will update automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Search Box (Only filter judges can control) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Search Entry
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or entry number..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px] pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">
                Showing {filteredEntries.length} of {entries.length} entries
                {adminFilters.category_filter && ` (filtered by admin)`}
              </p>
              <p className="text-sm font-semibold text-teal-600">
                Scored {progress.scored} of {progress.total}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* ENTRY NAVIGATION PANEL - Desktop */}
          <div className="hidden lg:block lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-3">Entries</h3>
            <div className="space-y-2">
              {filteredEntries.map((entry, index) => (
                <button
                  key={entry.id}
                  onClick={() => jumpToEntry(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    index === currentIndex
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {scoredEntries.has(entry.id) ? '✓' : '○'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        #{entry.entry_number} {entry.competitor_name}
                      </p>
                      <p className="text-xs truncate opacity-80">
                        {getCategoryName(entry.category_id)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ENTRY NAVIGATION - Mobile Dropdown */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowEntryList(!showEntryList)}
              className="w-full bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-4 py-3 text-left flex items-center justify-between"
            >
              <span className="font-semibold text-gray-800">
                Entry #{currentEntry.entry_number} of {filteredEntries.length}
              </span>
              <span className="text-teal-600">{showEntryList ? '▲' : '▼'}</span>
            </button>

            {showEntryList && (
              <div className="mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 max-h-64 overflow-y-auto">
                {filteredEntries.map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => jumpToEntry(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
                      index === currentIndex
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span className="mr-2">{scoredEntries.has(entry.id) ? '✓' : '○'}</span>
                    #{entry.entry_number} {entry.competitor_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN SCORING AREA */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 overflow-y-auto max-h-[800px]">
            {/* ENTRY DISPLAY */}
            <div className="mb-6 pb-6 border-b-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {currentEntry.photo_url ? (
                    <LazyLoadImage
                      src={currentEntry.photo_url}
                      alt={currentEntry.competitor_name}
                      effect="blur"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-gray-300"
                      placeholder={
                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 rounded-lg flex items-center justify-center text-5xl animate-pulse">
                          {isGroup(currentEntry) ? '👥' : '💃'}
                        </div>
                      }
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 rounded-lg flex items-center justify-center text-5xl">
                      {isGroup(currentEntry) ? '👥' : '💃'}
                    </div>
                  )}
                </div>

                {/* Entry Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-4xl font-bold text-gray-800">
                      #{currentEntry.entry_number}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        {currentEntry.competitor_name} {currentEntry.age && `(${currentEntry.age})`}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          {getCategoryName(currentEntry.category_id)}
                        </span>
                        {currentEntry.age_division_id && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {getAgeDivisionName(currentEntry.age_division_id)}
                          </span>
                        )}
                        <AbilityBadge abilityLevel={currentEntry.ability_level} size="md" />
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                          {getDivisionType(currentEntry)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group Members */}
                  {isGroup(currentEntry) && groupMembers.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedGroup(!expandedGroup)}
                        className="text-teal-600 hover:text-teal-800 font-semibold text-sm flex items-center gap-1"
                      >
                        {expandedGroup ? '▼' : '▶'} Group of {groupMembers.length} members
                      </button>
                      {expandedGroup && (
                        <ul className="mt-2 ml-4 space-y-1">
                          {groupMembers.map((member, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              • {member.name} {member.age && `(${member.age} years)`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SCORING FORM */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800">Score this Performance</h3>

              {/* Score Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Technique */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Technique
                    <span className="text-sm text-gray-500 ml-2">(0-25 points)</span>
                  </label>
                  <input
                    type="number"
                    value={technique}
                    onChange={(e) => setTechnique(e.target.value)}
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="0.0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-lg min-h-[60px]"
                    aria-label="Technique score (0-25 points)"
                  />
                </div>

                {/* Creativity & Choreography */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Creativity & Choreography
                    <span className="text-sm text-gray-500 ml-2">(0-25 points)</span>
                  </label>
                  <input
                    type="number"
                    value={creativity}
                    onChange={(e) => setCreativity(e.target.value)}
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="0.0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-lg min-h-[60px]"
                    aria-label="Creativity and choreography score (0-25 points)"
                  />
                </div>

                {/* Presentation */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Presentation
                    <span className="text-sm text-gray-500 ml-2">(0-25 points)</span>
                  </label>
                  <input
                    type="number"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="0.0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-lg min-h-[60px]"
                    aria-label="Presentation score (0-25 points)"
                  />
                </div>

                {/* Appearance & Costume */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Appearance & Costume
                    <span className="text-sm text-gray-500 ml-2">(0-25 points)</span>
                  </label>
                  <input
                    type="number"
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="0.0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-lg min-h-[60px]"
                    aria-label="Appearance and costume score (0-25 points)"
                  />
                </div>
              </div>

              {/* TOTAL SCORE DISPLAY */}
              <div className="bg-gradient-to-r from-gray-50 to-teal-50 border-2 border-teal-300 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">TOTAL SCORE</p>
                <p className={`text-4xl sm:text-5xl font-bold ${getTotalColor()}`}>
                  {total.toFixed(1)} / 100
                </p>
              </div>

              {/* JUDGE NOTES */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Judge Notes (Optional but Recommended)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Notes are important for tie-breaking
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setNotes(e.target.value);
                    }
                  }}
                  placeholder="Comments about this performance..."
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base min-h-[150px] resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {notes.length} / 500 characters
                </p>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={moveToPreviousEntry}
                  disabled={currentIndex === 0 || saving}
                  className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[56px]"
                >
                  ← Previous Entry
                </button>

                {currentIndex < filteredEntries.length - 1 ? (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transition-all shadow-lg min-h-[56px]"
                  >
                    {saving ? 'Saving...' : 'Save & Next Entry →'}
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 transition-all shadow-lg min-h-[56px]"
                  >
                    {saving ? 'Saving...' : 'Submit All & Finish'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 pb-8">
          <p className="font-semibold">TOPAZ 2.0 © 2025</p>
          <p className="mt-1">Heritage Since 1972 | Judge Scoring Interface</p>
        </div>
      </div>
    </Layout>
  );
}

export default ScoringInterface;
