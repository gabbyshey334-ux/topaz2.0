import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import RankBadge from '../components/RankBadge';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';
import { getCompetition } from '../supabase/competitions';
import { getCompetitionCategories } from '../supabase/categories';
import { getCompetitionAgeDivisions } from '../supabase/ageDivisions';
import { getCompetitionEntries } from '../supabase/entries';
import { getCompetitionScores } from '../supabase/scores';
import { subscribeToScores, unsubscribeFromChannel } from '../supabase/realtime';
import { generateScoreSheet } from '../utils/pdfGenerator';
import { exportResultsToExcel } from '../utils/excelExport';

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { competitionId } = location.state || {};

  // State - Data
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ageDivisions, setAgeDivisions] = useState([]);
  const [entries, setEntries] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // State - Filters
  const [selectedFilter, setSelectedFilter] = useState('overall');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAgeDivision, setSelectedAgeDivision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State - UI
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ENTRIES_PER_PAGE = 20;

  // Redirect if no competitionId
  useEffect(() => {
    if (!competitionId) {
      toast.error('No competition selected');
      navigate('/');
    }
  }, [competitionId, navigate]);

  // Load all data from Supabase
  useEffect(() => {
    const loadAllData = async () => {
      if (!competitionId) return;

      try {
        setLoading(true);
        console.log('Loading competition results data...');

        // Load all data in parallel
        const [compResult, catsResult, divsResult, entriesResult, scoresResult] = await Promise.all([
          getCompetition(competitionId),
          getCompetitionCategories(competitionId),
          getCompetitionAgeDivisions(competitionId),
          getCompetitionEntries(competitionId),
          getCompetitionScores(competitionId)
        ]);

        if (!compResult.success) throw new Error(compResult.error);

        setCompetition(compResult.data);
        setCategories(catsResult.success ? catsResult.data : []);
        setAgeDivisions(divsResult.success ? divsResult.data : []);
        setEntries(entriesResult.success ? entriesResult.data : []);
        setScores(scoresResult.success ? scoresResult.data : []);

        console.log('✅ Results data loaded:', {
          competition: compResult.data,
          categories: catsResult.data?.length,
          ageDivisions: divsResult.data?.length,
          entries: entriesResult.data?.length,
          scores: scoresResult.data?.length
        });

        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading results:', error);
        toast.error(`Failed to load results: ${error.message}`);
        setLoading(false);
      }
    };

    loadAllData();
  }, [competitionId]);

  // Subscribe to real-time score updates
  useEffect(() => {
    if (!competitionId) return;

    console.log('📡 Setting up real-time score updates...');

    const channel = subscribeToScores(competitionId, async (payload) => {
      console.log('📡 Score update received:', payload);
      
      // Reload scores
      try {
        const scoresResult = await getCompetitionScores(competitionId);
        if (scoresResult.success) {
          setScores(scoresResult.data);
          toast.info('Scores updated!', { autoClose: 2000 });
        }
      } catch (error) {
        console.error('Error reloading scores:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('📡 Cleaning up real-time subscription');
      unsubscribeFromChannel(channel);
    };
  }, [competitionId]);

  // Calculate results with rankings
  const rankedResults = useMemo(() => {
    if (entries.length === 0 || scores.length === 0) return [];

    // Calculate average score for each entry
    const entriesWithAverages = entries.map(entry => {
      const entryScores = scores.filter(s => s.entry_id === entry.id);
      
      if (entryScores.length === 0) {
        return { ...entry, averageScore: 0, judgeCount: 0, hasScores: false };
      }

      const avgScore = entryScores.reduce((sum, s) => sum + s.total_score, 0) / entryScores.length;
      
      return {
        ...entry,
        averageScore: parseFloat(avgScore.toFixed(2)),
        judgeCount: entryScores.length,
        hasScores: true
      };
    });

    // Filter out entries without scores
    const scoredEntries = entriesWithAverages.filter(e => e.hasScores);

    // Sort by average score (highest first)
    scoredEntries.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      // If tied, sort alphabetically
      return a.competitor_name.localeCompare(b.competitor_name);
    });

    // Assign ranks and detect ties
    let currentRank = 1;
    scoredEntries.forEach((entry, index) => {
      if (index > 0 && entry.averageScore === scoredEntries[index - 1].averageScore) {
        // Same score as previous = same rank (tie)
        entry.rank = scoredEntries[index - 1].rank;
        entry.isTied = true;
        scoredEntries[index - 1].isTied = true;
      } else {
        entry.rank = currentRank;
        entry.isTied = false;
      }
      currentRank++;
    });

    return scoredEntries;
  }, [entries, scores]);

  // Apply filters
  const filteredResults = useMemo(() => {
    let filtered = [...rankedResults];

    // Filter by category
    if (selectedFilter === 'category' && selectedCategory) {
      filtered = filtered.filter(e => e.category_id === selectedCategory);
    }

    // Filter by age division
    if (selectedFilter === 'age' && selectedAgeDivision) {
      filtered = filtered.filter(e => e.age_division_id === selectedAgeDivision);
    }

    // Filter by medal program
    if (selectedFilter === 'medal') {
      filtered = filtered.filter(e => 
        e.dance_type && e.dance_type.includes('Medal: true')
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.competitor_name.toLowerCase().includes(query) ||
        e.entry_number.toString().includes(query)
      );
    }

    // Re-rank filtered results
    filtered.forEach((entry, index) => {
      entry.filteredRank = index + 1;
    });

    return filtered;
  }, [rankedResults, selectedFilter, selectedCategory, selectedAgeDivision, searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedCategory, selectedAgeDivision, searchQuery]);

  // Paginate results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    const endIndex = startIndex + ENTRIES_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage, ENTRIES_PER_PAGE]);

  const totalPages = Math.ceil(filteredResults.length / ENTRIES_PER_PAGE);

  // Helper functions
  const toggleExpand = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handlePrintResults = () => {
    window.print();
  };

  const handleExportExcel = () => {
    try {
      const result = exportResultsToExcel(rankedResults, scores, competition, categories, ageDivisions);
      if (result.success) {
        toast.success(`Excel file downloaded: ${result.fileName}`);
      } else {
        toast.error(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  const handlePrintScoreSheet = (entry) => {
    try {
      const entryScores = scores.filter(s => s.entry_id === entry.id);
      const result = generateScoreSheet(entry, entryScores, competition, categories);
      if (result.success) {
        toast.success('Score sheet downloaded!');
      } else {
        toast.error(`PDF generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate score sheet');
    }
  };

  const handleNewCompetition = () => {
    if (window.confirm('Start a new competition? This will return to the home page.')) {
      navigate('/');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const getAgeDivisionName = (divisionId) => {
    const div = ageDivisions.find(d => d.id === divisionId);
    return div ? div.name : null;
  };

  const getDivisionType = (entry) => {
    if (!entry.dance_type) return 'Solo';
    const match = entry.dance_type.match(/^([^|]+)/);
    return match ? match[1].trim() : 'Solo';
  };

  const isGroup = (entry) => {
    return entry.dance_type && entry.dance_type.includes('group');
  };

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

  const isMedalProgram = (entry) => {
    return entry.dance_type && entry.dance_type.includes('Medal: true');
  };

  if (loading) {
    return <LoadingSpinner message="Loading competition results..." />;
  }

  if (!competition) {
    return (
      <Layout overlayOpacity="bg-white/90">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Competition not found</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600"
            >
              Return to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout overlayOpacity="bg-white/95">
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* HEADER */}
        <div className="mb-8 text-center">
          {/* Logo placeholders */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">🎭</span>
            <span className="text-5xl">💎</span>
            <span className="text-4xl">💃</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {competition.name}
          </h1>
          
          {competition.date && (
            <p className="text-lg text-gray-600 mb-1">
              {new Date(competition.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
          
          {competition.venue && (
            <p className="text-md text-gray-500 mb-3">{competition.venue}</p>
          )}
          
          <p className="text-xl font-semibold text-teal-600 mb-6">
            Official Results & Rankings
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={handlePrintResults}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg min-h-[48px] flex items-center gap-2"
            >
              🖨️ Print Results
            </button>
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg min-h-[48px] flex items-center gap-2"
            >
              📊 Export to Excel
            </button>
            <button
              onClick={handleNewCompetition}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg min-h-[48px] flex items-center gap-2"
            >
              ➕ New Competition
            </button>
          </div>
        </div>

        {/* FILTERING SYSTEM */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Overall button */}
            <button
              onClick={() => {
                setSelectedFilter('overall');
                setSelectedCategory(null);
                setSelectedAgeDivision(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
                selectedFilter === 'overall'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏆 Overall Grand Champion
            </button>

            {/* Category buttons */}
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedFilter('category');
                  setSelectedCategory(cat.id);
                  setSelectedAgeDivision(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
                  selectedFilter === 'category' && selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Age division buttons */}
            {ageDivisions.map(div => (
              <button
                key={div.id}
                onClick={() => {
                  setSelectedFilter('age');
                  setSelectedAgeDivision(div.id);
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
                  selectedFilter === 'age' && selectedAgeDivision === div.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {div.name} ({div.min_age}-{div.max_age})
              </button>
            ))}

            {/* Medal Program button */}
            {entries.some(e => isMedalProgram(e)) && (
              <button
                onClick={() => {
                  setSelectedFilter('medal');
                  setSelectedCategory(null);
                  setSelectedAgeDivision(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
                  selectedFilter === 'medal'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⭐ Medal Program
              </button>
            )}
          </div>

          {/* Search Box */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or entry number..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
            />
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Showing {paginatedResults.length} of {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* RESULTS DISPLAY */}
        {filteredResults.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Results Found"
            description={searchQuery ? `No results found matching "${searchQuery}"` : "No results match the selected filters. Try adjusting your filters or check back after judges have entered scores."}
          />
        ) : (
          <div className="space-y-4">
            {paginatedResults.map((entry) => {
              const entryScores = scores.filter(s => s.entry_id === entry.id);
              const isExpanded = expandedEntries.has(entry.id);
              const groupMembers = isGroup(entry) ? parseGroupMembers(entry.dance_type) : [];

              return (
                <div
                  key={entry.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Main Card */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <RankBadge 
                          rank={selectedFilter === 'overall' ? entry.rank : entry.filteredRank} 
                          isTied={entry.isTied} 
                        />
                      </div>

                      {/* Photo */}
                      <div className="flex-shrink-0">
                        {entry.photo_url ? (
                          <LazyLoadImage
                            src={entry.photo_url}
                            alt={entry.competitor_name}
                            effect="blur"
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border-2 border-gray-300"
                            placeholder={
                              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-4xl animate-pulse">
                                {isGroup(entry) ? '👥' : '💃'}
                              </div>
                            }
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                            {isGroup(entry) ? '👥' : '💃'}
                          </div>
                        )}
                      </div>

                      {/* Entry Info */}
                      <div className="flex-1">
                        <div className="mb-2">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            #{entry.entry_number} {entry.competitor_name}
                          </h2>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <CategoryBadge categoryName={getCategoryName(entry.category_id)} />
                          {entry.age_division_id && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {getAgeDivisionName(entry.age_division_id)}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {getDivisionType(entry)}
                          </span>
                          {isMedalProgram(entry) && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                              ⭐ Medal
                            </span>
                          )}
                        </div>

                        {isGroup(entry) && groupMembers.length > 0 && (
                          <p className="text-sm text-gray-600 mb-3">
                            Group of {groupMembers.length} members
                          </p>
                        )}

                        {/* Judge Scores */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entryScores.map(score => (
                            <div
                              key={score.id}
                              className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                            >
                              <span className="font-semibold">Judge {score.judge_number}:</span>{' '}
                              <span className="text-teal-600 font-bold">{score.total_score.toFixed(1)}/100</span>
                            </div>
                          ))}
                        </div>

                        {/* Average Score */}
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg inline-block">
                          <span className="font-semibold">AVERAGE: </span>
                          <span className="text-xl font-bold">{entry.averageScore.toFixed(2)} / 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => handlePrintScoreSheet(entry)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors min-h-[44px]"
                      >
                        📄 Print Score Sheet
                      </button>
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors min-h-[44px]"
                      >
                        {isExpanded ? '▲ Collapse' : '▼ View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="bg-gray-50 p-4 sm:p-6 border-t-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Score Breakdown</h3>
                      
                      {entryScores.map(score => (
                        <div key={score.id} className="mb-6 last:mb-0">
                          <h4 className="text-md font-bold text-teal-600 mb-3">Judge {score.judge_number}</h4>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Technique</p>
                              <p className="text-lg font-bold text-gray-800">{score.technique.toFixed(1)} / 25</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Creativity</p>
                              <p className="text-lg font-bold text-gray-800">{score.creativity.toFixed(1)} / 25</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Presentation</p>
                              <p className="text-lg font-bold text-gray-800">{score.presentation.toFixed(1)} / 25</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Appearance</p>
                              <p className="text-lg font-bold text-gray-800">{score.appearance.toFixed(1)} / 25</p>
                            </div>
                          </div>

                          <div className="bg-teal-100 p-3 rounded-lg mb-3">
                            <p className="text-sm font-semibold text-teal-800">
                              Total: <span className="text-lg">{score.total_score.toFixed(1)} / 100</span>
                            </p>
                          </div>

                          {score.notes && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                              <p className="text-xs font-semibold text-yellow-800 mb-1">Judge Notes:</p>
                              <p className="text-sm text-gray-700">{score.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Overall Average */}
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-lg text-center">
                        <p className="text-sm font-semibold mb-1">OVERALL AVERAGE</p>
                        <p className="text-3xl font-bold">{entry.averageScore.toFixed(2)} / 100</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredResults.length > ENTRIES_PER_PAGE && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className={`px-6 py-3 rounded-lg font-semibold min-h-[48px] transition-colors ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              ← Previous
            </button>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <p className="text-sm text-gray-500">
                Showing {paginatedResults.length} entries
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className={`px-6 py-3 rounded-lg font-semibold min-h-[48px] transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              Next →
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p className="font-semibold">TOPAZ 2.0 © 2025</p>
          <p className="mt-1">Heritage Since 1972 | Official Competition Results</p>
        </div>
      </div>
    </Layout>
  );
}

export default ResultsPage;
