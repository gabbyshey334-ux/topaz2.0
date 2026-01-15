import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../supabase/config';
import { subscribeToTable, unsubscribeFromChannel } from '../supabase/realtime';
import { deleteCompetition, bulkDeleteCompetitions, deleteAllCompetitions } from '../supabase/competitions';

function WelcomePage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCompetitions, setShowAllCompetitions] = useState(false);
  const [selectedCompetitions, setSelectedCompetitions] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDangerZone, setShowDangerZone] = useState(false);

  // Ready-made image paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  // Load competitions from database
  useEffect(() => {
    loadCompetitions();
  }, []);

  // Real-time subscription for competition updates
  useEffect(() => {
    const channel = subscribeToTable('competitions', () => {
      console.log('🔄 Competition list updated - reloading...');
      loadCompetitions();
      toast.info('Competition list updated!', { autoClose: 2000 });
    });

    return () => {
      if (channel) unsubscribeFromChannel(channel);
    };
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      
      // Fetch competitions with entry count
      const { data: comps, error: compsError } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (compsError) throw compsError;

      // Get entry counts for each competition
      const compsWithCounts = await Promise.all(
        (comps || []).map(async (comp) => {
          const { count, error: countError } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', comp.id);

          if (countError) {
            console.error('Error counting entries:', countError);
            return { ...comp, entry_count: 0 };
          }

          return { ...comp, entry_count: count || 0 };
        })
      );

      setCompetitions(compsWithCounts);
      console.log('✅ Loaded competitions:', compsWithCounts.length);
    } catch (error) {
      console.error('❌ Error loading competitions:', error);
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCompetition = (comp) => {
    navigate('/judge-selection', {
      state: {
        competitionId: comp.id,
        competitionName: comp.name,
        competitionDate: comp.date,
        venue: comp.venue,
        judgeCount: comp.judges_count
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDeleteCompetition = async (comp) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${comp.name}"?\n\n` +
      `This will permanently delete:\n` +
      `• ${comp.entry_count || 0} entries\n` +
      `• All scores and results\n` +
      `• All photos and data\n\n` +
      `This action cannot be undone!`
    );
    
    if (!confirmed) return;
    
    setDeletingId(comp.id);
    
    try {
      const result = await deleteCompetition(comp.id);
      
      if (result.success) {
        toast.success(`"${comp.name}" deleted successfully!`);
        loadCompetitions();
        // Remove from selected if it was selected
        setSelectedCompetitions(prev => prev.filter(id => id !== comp.id));
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCompetitions.length === 0) {
      toast.error('Please select competitions to delete');
      return;
    }
    
    const confirmed = window.confirm(
      `Delete ${selectedCompetitions.length} competition${selectedCompetitions.length > 1 ? 's' : ''}?\n\n` +
      `This will permanently delete all entries, scores, photos, and data.\n` +
      `This action cannot be undone!`
    );
    
    if (!confirmed) return;
    
    setBulkDeleting(true);
    
    try {
      const result = await bulkDeleteCompetitions(selectedCompetitions);
      
      if (result.success) {
        toast.success(result.message);
        loadCompetitions();
        setSelectedCompetitions([]);
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('An error occurred during bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    const firstConfirm = window.confirm(
      `⚠️ DELETE ALL COMPETITIONS?\n\n` +
      `This will delete EVERY competition in the system (${competitions.length} total).\n` +
      `Are you absolutely sure? This cannot be undone!`
    );
    
    if (!firstConfirm) return;
    
    const confirmText = prompt('Type "DELETE ALL" to confirm:');
    if (confirmText !== 'DELETE ALL') {
      toast.error('Deletion cancelled - text did not match');
      return;
    }
    
    setBulkDeleting(true);
    
    try {
      const result = await deleteAllCompetitions();
      
      if (result.success) {
        toast.success(result.message);
        loadCompetitions();
        setSelectedCompetitions([]);
      } else {
        toast.error(`Failed to delete all: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('An error occurred during delete all');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectCompetition = (compId) => {
    setSelectedCompetitions(prev => 
      prev.includes(compId) 
        ? prev.filter(id => id !== compId)
        : [...prev, compId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCompetitions.length === competitions.length) {
      setSelectedCompetitions([]);
    } else {
      setSelectedCompetitions(competitions.map(c => c.id));
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        
        {/* Responsive Branding Section - Always Horizontal */}
        <div className="mb-8 md:mb-12 animate-fade-in flex flex-row items-center justify-center gap-4 sm:gap-12 w-full">
          {/* Left Side Image - Scaled for all devices */}
          <div className="w-16 h-20 xs:w-24 xs:h-32 md:w-32 md:h-40 flex items-center justify-center">
            <img 
              src={leftImagePath} 
              alt="" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  parent.innerHTML = '<span class="text-3xl xs:text-4xl md:text-6xl drop-shadow-sm opacity-40">🩰</span>';
                }
              }}
            />
          </div>

          {/* Center Logo - Scaled for all devices */}
          <div className="w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 flex items-center justify-center">
            <img 
              src={logoPath} 
              alt="TOPAZ 2.0 Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  parent.innerHTML = '<span class="text-4xl xs:text-5xl md:text-7xl drop-shadow-sm opacity-40">🎭</span>';
                }
              }}
            />
          </div>

          {/* Right Side Image - Scaled for all devices */}
          <div className="w-16 h-20 xs:w-24 xs:h-32 md:w-32 md:h-40 flex items-center justify-center">
            <img 
              src={rightImagePath} 
              alt="" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  parent.innerHTML = '<span class="text-3xl xs:text-4xl md:text-6xl drop-shadow-sm opacity-40">💃</span>';
                }
              }}
            />
          </div>
        </div>

        {/* Title Section - Responsive font sizes */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-3 text-center px-4">
          TOPAZ 2.0 Scoring System
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-teal-600 font-semibold mb-8 md:mb-12 text-center">
          Since 1972 - Modernized for Today
        </p>

        {/* Description - Responsive text and max-width */}
        <p className="text-sm sm:text-base text-gray-700 mb-8 md:mb-10 text-center max-w-xs sm:max-w-md md:max-w-xl leading-relaxed px-4">
          Professional digital scoring for dance competitions with automatic 
          calculations, rankings, and real-time results
        </p>

        {/* Available Competitions Section */}
        {loading ? (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 font-semibold">Loading competitions...</p>
            </div>
          </div>
        ) : competitions.length > 0 ? (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-teal-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-teal-600 flex items-center gap-2">
                  <span>📋</span> Available Competitions
                </h2>
                {competitions.length > 3 && (
                  <button
                    onClick={() => setShowAllCompetitions(!showAllCompetitions)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    {showAllCompetitions ? 'Show Less' : `Show All (${competitions.length})`}
                  </button>
                )}
              </div>

              {/* Bulk Actions */}
              {competitions.length > 1 && (
                <div className="mb-4 flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-all"
                  >
                    {selectedCompetitions.length === competitions.length ? '☑️ Deselect All' : '☐ Select All'}
                  </button>
                  
                  {selectedCompetitions.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 flex items-center gap-2 text-sm font-bold transition-all"
                    >
                      {bulkDeleting ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete {selectedCompetitions.length} Selected
                        </>
                      )}
                    </button>
                  )}
                  
                  {competitions.length > 5 && (
                    <button
                      onClick={() => setShowDangerZone(!showDangerZone)}
                      className="ml-auto px-3 py-2 text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      {showDangerZone ? 'Hide' : 'Show'} Danger Zone
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {(showAllCompetitions ? competitions : competitions.slice(0, 3)).map((comp) => (
                  <div
                    key={comp.id}
                    className={`bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border-2 transition-all relative ${
                      selectedCompetitions.includes(comp.id)
                        ? 'border-red-400 bg-red-50'
                        : 'border-teal-200 hover:border-teal-400 hover:shadow-md'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedCompetitions.includes(comp.id)}
                      onChange={() => toggleSelectCompetition(comp.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 left-3 w-5 h-5 cursor-pointer accent-red-500 z-10"
                      title="Select for bulk delete"
                    />
                    
                    <div 
                      className="cursor-pointer ml-8"
                      onClick={() => handleContinueCompetition(comp)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                            {comp.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              📅 {formatDate(comp.date)}
                            </span>
                            {comp.venue && (
                              <span className="flex items-center gap-1">
                                📍 {comp.venue}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          comp.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {comp.status === 'active' ? '🟢 Active' : '⚪ Completed'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-teal-600">{comp.entry_count}</span> entries
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-teal-600">{comp.judges_count}</span> judges
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCompetition(comp);
                            }}
                            disabled={deletingId === comp.id}
                            className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:bg-gray-400 flex items-center gap-1 transition-all"
                            title="Delete Competition"
                          >
                            {deletingId === comp.id ? (
                              <Loader className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContinueCompetition(comp);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {competitions.length > 3 && !showAllCompetitions && (
                <div className="mt-3 text-center text-sm text-gray-500">
                  + {competitions.length - 3} more competitions
                </div>
              )}

              {/* Danger Zone */}
              {showDangerZone && competitions.length > 5 && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                  <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                    ⚠️ Danger Zone
                  </h3>
                  <p className="text-red-700 text-sm mb-3">
                    These actions are permanent and cannot be undone!
                  </p>
                  <button
                    onClick={handleDeleteAll}
                    disabled={bulkDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
                  >
                    {bulkDeleting ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        Deleting All...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete ALL {competitions.length} Competitions
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">🎭</div>
              <p className="text-gray-600 font-semibold mb-2">No Competitions Yet</p>
              <p className="text-sm text-gray-500">Create your first competition to get started!</p>
            </div>
          </div>
        )}

        {/* Action Buttons - Touch friendly and responsive width */}
        <div className="flex flex-col gap-4 w-full max-w-[280px] sm:max-w-md px-4">
          <button
            onClick={() => navigate('/setup')}
            className="w-full py-4 sm:py-5 px-6 sm:px-8 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-lg sm:text-xl font-bold rounded-xl 
                       hover:from-cyan-600 hover:to-teal-600 active:scale-95 transition-all shadow-lg 
                       hover:shadow-cyan-500/50 min-h-[56px]"
          >
            ➕ Start New Competition
          </button>
          
          <button
            onClick={() => setShowInstructions(true)}
            className="w-full py-4 sm:py-5 px-6 sm:px-8 bg-white/80 backdrop-blur-sm text-teal-600 text-lg sm:text-xl font-semibold rounded-xl 
                       border-2 border-teal-500 hover:bg-teal-50 active:scale-95 transition-all shadow-md min-h-[56px]"
          >
            📖 View Instructions
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 text-center text-xs sm:text-sm text-gray-500 pb-8">
          <p className="font-semibold">TOPAZ 2.0 © 2025</p>
          <p className="mt-1">Heritage Since 1972 | v1.0 MVP</p>
        </div>

        {/* Instructions Modal - Responsive sizing */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-8 z-50 overflow-y-auto"
               onClick={() => setShowInstructions(false)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-4">Quick Start Guide</h2>
              <ul className="text-gray-700 text-sm sm:text-base space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">✓</span>
                  <span>Set up competition details and dancers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">✓</span>
                  <span>Select judge and enter scores per category</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">✓</span>
                  <span>System calculates totals automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">✓</span>
                  <span>View rankings and export results</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors min-h-[44px]"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default WelcomePage;
