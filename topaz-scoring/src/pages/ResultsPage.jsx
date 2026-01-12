import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';
import AbilityBadge from '../components/AbilityBadge';
import MedalBadge, { getMedalProgress } from '../components/MedalBadge';
import { getCompetition } from '../supabase/competitions';
import { getCompetitionCategories } from '../supabase/categories';
import { getCompetitionAgeDivisions } from '../supabase/ageDivisions';
import { getCompetitionEntries, awardMedalPointsToWinners } from '../supabase/entries';
import { getCompetitionScores } from '../supabase/scores';
import { subscribeToScores, unsubscribeFromChannel } from '../supabase/realtime';
import { generateScoreSheet } from '../utils/pdfGenerator';
import { exportResultsToExcel } from '../utils/excelExport';

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { competitionId } = location.state || {};

  // Special Categories
  const specialCategoryNames = ['Production', 'Student Choreography', 'Teacher/Student'];

  // State
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ageDivisions, setAgeDivisions] = useState([]);
  const [entries, setEntries] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('overall');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAgeDivision, setSelectedAgeDivision] = useState(null);
  const [selectedAbilityLevel, setSelectedAbilityLevel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [awardingPoints, setAwardingPoints] = useState(false);
  const [showMedalStandings, setShowMedalStandings] = useState(false);

  // Redirect if no competitionId
  useEffect(() => {
    if (!competitionId) {
      toast.error('No competition selected');
      navigate('/');
    }
  }, [competitionId, navigate]);

  // Load data
  useEffect(() => {
    const loadAllData = async () => {
      if (!competitionId) return;

      try {
        setLoading(true);
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
        setLoading(false);
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error(`Failed to load results: ${error.message}`);
        setLoading(false);
      }
    };

    loadAllData();
  }, [competitionId]);

  // Real-time updates
  useEffect(() => {
    if (!competitionId) return;

    const channel = subscribeToScores(competitionId, async () => {
      const scoresResult = await getCompetitionScores(competitionId);
      if (scoresResult.success) {
        setScores(scoresResult.data);
        toast.info('Scores updated!', { autoClose: 2000 });
      }
    });

    return () => unsubscribeFromChannel(channel);
  }, [competitionId]);

  // Calculate ranked results
  const rankedResults = useMemo(() => {
    if (entries.length === 0 || scores.length === 0) return [];

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
        hasScores: true,
        scores: entryScores
      };
    });

    const scoredEntries = entriesWithAverages.filter(e => e.hasScores);
    scoredEntries.sort((a, b) => b.averageScore - a.averageScore);

    let currentRank = 1;
    scoredEntries.forEach((entry, index) => {
      if (index > 0 && entry.averageScore === scoredEntries[index - 1].averageScore) {
        entry.rank = scoredEntries[index - 1].rank;
      } else {
        entry.rank = currentRank;
      }
      currentRank++;
    });

    return scoredEntries;
  }, [entries, scores]);

  // Filter results
  const filteredResults = useMemo(() => {
    let filtered = [...rankedResults];

    if (selectedCategory) {
      filtered = filtered.filter(e => e.category_id === selectedCategory);
    }
    if (selectedAgeDivision) {
      filtered = filtered.filter(e => e.age_division_id === selectedAgeDivision);
    }
    if (selectedAbilityLevel) {
      filtered = filtered.filter(e => e.ability_level === selectedAbilityLevel);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.competitor_name.toLowerCase().includes(query) ||
        e.entry_number.toString().includes(query)
      );
    }

    return filtered;
  }, [rankedResults, selectedCategory, selectedAgeDivision, selectedAbilityLevel, searchQuery]);

  // Helper functions
  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getAgeDivisionName = (divisionId) => {
    return ageDivisions.find(d => d.id === divisionId)?.name || '';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-teal-500 to-cyan-500';
  };

  const getRankBorderColor = (rank) => {
    if (rank === 1) return 'border-yellow-400';
    if (rank === 2) return 'border-gray-300';
    if (rank === 3) return 'border-orange-400';
    return 'border-gray-200';
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const toggleExpanded = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handlePrintScoreSheet = (entry) => {
    const category = categories.find(c => c.id === entry.category_id);
    const ageDivision = ageDivisions.find(d => d.id === entry.age_division_id);
    generateScoreSheet(entry, entry.scores, category, ageDivision, competition);
  };

  const handleExport = () => {
    const category = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
    const ageDivision = selectedAgeDivision ? ageDivisions.find(d => d.id === selectedAgeDivision) : null;
    exportResultsToExcel(filteredResults, categories, ageDivisions, competition, category, ageDivision);
    toast.success('Results exported to Excel!');
  };

  const handlePrintAll = () => {
    window.print();
  };

  // Loading state
  if (loading) {
    return (
      <Layout overlayOpacity="bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 border-6 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 font-semibold">Loading Championship Results...</p>
        </div>
      </Layout>
    );
  }

  // No competition
  if (!competition) {
    return (
      <Layout overlayOpacity="bg-white/90">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Competition not found</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout overlayOpacity="bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* CHAMPIONSHIP HEADER */}
          <div className="text-center mb-12">
            {/* Logos */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24">
                <img src="/left-dancer.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                <img src="/logo.png" alt="TOPAZ 2.0" className="w-full h-full object-contain" />
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24">
                <img src="/right-dancer.png" alt="" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-wider mb-3">
              TOPAZ 2.0 DANCE COMPETITION
            </h1>
            
            {/* Decorative Divider */}
            <div className="w-48 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto mb-4"></div>
            
            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 tracking-widest mb-6">
              OFFICIAL COMPETITION RESULTS
            </h2>

            {/* Competition Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto mb-8">
              <h3 className="text-3xl font-bold text-teal-600 mb-2">{competition.name}</h3>
              <p className="text-lg text-gray-600 mb-4">{new Date(competition.date).toLocaleDateString()}</p>
              <p className="text-gray-500">
                {rankedResults.length} total entries • {competition.judges_count} judges • {categories.length} categories
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              <span className="text-xl">🖨</span>
              <span>Print Results</span>
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              <span className="text-xl">📊</span>
              <span>Export to Excel</span>
            </button>
            
            <button
              onClick={() => navigate('/setup')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-cyan-600 hover:to-teal-600 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              <span className="text-xl">➕</span>
              <span>New Competition</span>
            </button>
          </div>

          {/* FILTERS & SEARCH */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or entry number..."
                  className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-600">VIEW:</span>
              
              <button
                onClick={() => {
                  setSelectedFilter('overall');
                  setSelectedCategory(null);
                  setSelectedAgeDivision(null);
                  setSelectedAbilityLevel(null);
                }}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  selectedFilter === 'overall'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Results
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedFilter('category');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <p className="text-center text-sm text-gray-500">
              Showing {filteredResults.length} of {rankedResults.length} results
            </p>
          </div>

          {/* RESULTS CARDS */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">No Results Yet</h3>
              <p className="text-gray-600">Results will appear here once judges complete scoring.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredResults.map((entry) => {
                const isExpanded = expandedEntries.has(entry.id);
                const categoryName = getCategoryName(entry.category_id);
                const ageDivisionName = getAgeDivisionName(entry.age_division_id);

                return (
                  <div
                    key={entry.id}
                    className={`bg-white rounded-3xl shadow-xl border-3 ${getRankBorderColor(entry.rank)} overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300`}
                  >
                    {/* CARD HEADER */}
                    <div className={`bg-gradient-to-r ${getRankColor(entry.rank)} p-6 flex items-center gap-6 flex-wrap`}>
                      {/* Rank Badge */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                          <span className={`text-3xl font-extrabold ${entry.rank <= 3 ? getScoreColor(100) : 'text-teal-600'}`}>
                            {entry.rank}
                          </span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {entry.rank === 1 ? 'st' : entry.rank === 2 ? 'nd' : entry.rank === 3 ? 'rd' : 'th'}
                          </span>
                        </div>
                        {entry.rank <= 3 && (
                          <span className="absolute -top-2 -right-2 text-3xl">
                            {getMedalEmoji(entry.rank)}
                          </span>
                        )}
                      </div>

                      {/* Entry Photo */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                        {entry.photo_url ? (
                          <LazyLoadImage
                            src={entry.photo_url}
                            alt={entry.competitor_name}
                            effect="blur"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">👤</span>
                          </div>
                        )}
                      </div>

                      {/* Entry Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
                          #{entry.entry_number} {entry.competitor_name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-1.5 bg-white/30 backdrop-blur rounded-full text-sm font-bold text-white">
                            {categoryName}
                          </span>
                          {ageDivisionName && (
                            <span className="px-4 py-1.5 bg-white/30 backdrop-blur rounded-full text-sm font-bold text-white">
                              🎂 {ageDivisionName}
                            </span>
                          )}
                          <span className="px-4 py-1.5 bg-white/30 backdrop-blur rounded-full text-sm font-bold text-white">
                            ⭐ {entry.ability_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-8">
                      {/* Judge Scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                        {entry.scores.map((score) => (
                          <div key={score.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border-2 border-gray-200 shadow-sm">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                              Judge {score.judge_number}
                            </div>
                            <div className={`text-4xl font-extrabold ${getScoreColor(score.total_score)}`}>
                              {score.total_score.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-400">/ 100</div>
                          </div>
                        ))}
                      </div>

                      {/* Average Score */}
                      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-6 text-center mb-6">
                        <div className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">
                          Average Score
                        </div>
                        <div className="text-5xl font-black text-white drop-shadow-lg">
                          {entry.averageScore.toFixed(2)}
                        </div>
                        <div className="text-xl text-white/80">/ 100</div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 hover:border-teal-400 hover:text-teal-600 transition-all duration-200"
                      >
                        <span>{isExpanded ? '▲' : '▼'}</span>
                        <span>{isExpanded ? 'Hide Breakdown' : 'View Detailed Breakdown'}</span>
                      </button>

                      {/* EXPANDED BREAKDOWN */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6">
                          <h4 className="text-xl font-bold text-teal-600 mb-6">Detailed Score Breakdown</h4>
                          
                          {entry.scores.map((score) => (
                            <div key={score.id} className="mb-6 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">J{score.judge_number}</span>
                                </div>
                                <h5 className="text-lg font-bold text-gray-800">Judge {score.judge_number}</h5>
                              </div>

                              <div className="grid gap-3 mb-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                                    <span>🎯</span> Technique
                                  </span>
                                  <span className={`text-xl font-bold ${getScoreColor(score.technique)}`}>
                                    {score.technique} / 25
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                                    <span>✨</span> Creativity
                                  </span>
                                  <span className={`text-xl font-bold ${getScoreColor(score.creativity)}`}>
                                    {score.creativity} / 25
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                                    <span>🎭</span> Presentation
                                  </span>
                                  <span className={`text-xl font-bold ${getScoreColor(score.presentation)}`}>
                                    {score.presentation} / 25
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                                    <span>👗</span> Appearance
                                  </span>
                                  <span className={`text-xl font-bold ${getScoreColor(score.appearance)}`}>
                                    {score.appearance} / 25
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                                <span className="text-lg font-bold text-white uppercase">Total</span>
                                <span className="text-3xl font-extrabold text-white">
                                  {score.total_score.toFixed(1)} / 100
                                </span>
                              </div>

                              {score.notes && (
                                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span>📝</span>
                                    <span className="text-sm font-bold text-yellow-800 uppercase tracking-wider">
                                      Judge Notes
                                    </span>
                                  </div>
                                  <p className="text-yellow-900 italic leading-relaxed">{score.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Overall Average */}
                          <div className="p-8 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl text-center shadow-lg">
                            <div className="text-lg font-bold text-white/80 uppercase tracking-widest mb-3">
                              Final Average
                            </div>
                            <div className="text-6xl font-black text-white drop-shadow-xl">
                              {entry.averageScore.toFixed(2)} / 100
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER */}
                    <div className="px-8 py-5 bg-gray-50 border-t-2 border-gray-200 flex justify-end">
                      <button
                        onClick={() => handlePrintScoreSheet(entry)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <span>🖨</span>
                        <span>Print Score Sheet</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center">
            <p className="text-sm font-semibold text-gray-600 mb-2">TOPAZ 2.0 © 2025</p>
            <p className="text-xs text-gray-500">Heritage Since 1972 | Official Competition Results</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResultsPage;
