import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const competitionData = location.state || {};
  const { 
    competitionName, 
    competitionDate,
    venue,
    dancers = [], 
    judgeCount = 3
  } = competitionData;

  // Ready-made image paths for branding
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  // State for all judges' scores and selected dancer detail
  const [allJudgesScores, setAllJudgesScores] = useState({});
  const [selectedDancer, setSelectedDancer] = useState(null);
  const [rankings, setRankings] = useState([]);

  // Load all judges' scores from localStorage
  useEffect(() => {
    if (!competitionName) {
      navigate('/');
      return;
    }

    const scoresData = {};
    for (let judgeNum = 1; judgeNum <= judgeCount; judgeNum++) {
      const savedScores = localStorage.getItem(`scores_judge${judgeNum}_${competitionName}`);
      if (savedScores) {
        scoresData[judgeNum] = JSON.parse(savedScores);
      }
    }
    setAllJudgesScores(scoresData);
  }, [competitionName, judgeCount, navigate]);

  // Calculate rankings
  useEffect(() => {
    if (dancers.length === 0 || Object.keys(allJudgesScores).length === 0) {
      return;
    }

    const dancerResults = dancers.map(dancer => {
      const judgeScores = [];
      let totalScore = 0;
      let judgesWhoScored = 0;

      // Get scores from each judge
      for (let judgeNum = 1; judgeNum <= judgeCount; judgeNum++) {
        if (allJudgesScores[judgeNum] && allJudgesScores[judgeNum][dancer.id]) {
          const score = allJudgesScores[judgeNum][dancer.id];
          if (score.total > 0) {
            judgeScores.push({
              judgeNum,
              total: score.total,
              technique: score.technique,
              creativity: score.creativity,
              presentation: score.presentation,
              appearance: score.appearance
            });
            totalScore += score.total;
            judgesWhoScored++;
          }
        }
      }

      const averageScore = judgesWhoScored > 0 ? totalScore / judgesWhoScored : 0;

      return {
        ...dancer,
        judgeScores,
        averageScore,
        totalScore,
        judgesWhoScored
      };
    });

    // Sort by average score (descending)
    const sorted = dancerResults.sort((a, b) => b.averageScore - a.averageScore);

    // Assign ranks (handle ties)
    let currentRank = 1;
    sorted.forEach((dancer, index) => {
      if (index > 0 && dancer.averageScore === sorted[index - 1].averageScore) {
        dancer.rank = sorted[index - 1].rank; // Same rank for ties
      } else {
        dancer.rank = currentRank;
      }
      currentRank++;
    });

    setRankings(sorted);
  }, [dancers, allJudgesScores, judgeCount]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export to PDF (basic implementation)
  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here using libraries like jsPDF or html2canvas');
  };

  // Handle new competition
  const handleNewCompetition = () => {
    if (window.confirm('Start a new competition? This will clear all current data.')) {
      // Clear localStorage
      for (let judgeNum = 1; judgeNum <= judgeCount; judgeNum++) {
        localStorage.removeItem(`scores_judge${judgeNum}_${competitionName}`);
      }
      navigate('/');
    }
  };

  // Get rank display with medals for top 3
  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1:
        return { display: '🥇 1st', color: 'from-yellow-400 to-yellow-600' };
      case 2:
        return { display: '🥈 2nd', color: 'from-gray-300 to-gray-500' };
      case 3:
        return { display: '🥉 3rd', color: 'from-orange-400 to-orange-600' };
      default:
        return { display: `${rank}th`, color: 'from-gray-200 to-gray-400' };
    }
  };

  if (!competitionName) {
    return null;
  }

  return (
    <Layout overlayOpacity="bg-white/85">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header with Branding */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 w-full print:hidden">
          <button 
            onClick={() => navigate('/judge-selection', { state: competitionData })}
            className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-semibold flex items-center min-h-[44px] z-20"
          >
            ← <span className="hidden sm:inline ml-1">Back</span>
          </button>
          
          {/* Header Branding - Horizontal Three Logos */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 animate-fade-in flex-1 px-2">
            <div className="w-8 h-10 sm:w-10 sm:h-14 flex items-center justify-center">
              <img 
                src={leftImagePath} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl sm:text-2xl opacity-40">🩰</span>';
                  }
                }}
              />
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <img 
                src={logoPath} 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-2xl sm:text-3xl opacity-40">🎭</span>';
                  }
                }}
              />
            </div>
            <div className="w-8 h-10 sm:w-10 sm:h-14 flex items-center justify-center">
              <img 
                src={rightImagePath} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl sm:text-2xl opacity-40">💃</span>';
                  }
                }}
              />
            </div>
          </div>
          
          <div className="w-16 sm:w-20"></div>
        </div>

        {/* Competition Title Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {competitionName}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-1">
            {new Date(competitionDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {venue && <p className="text-sm sm:text-base text-gray-500">{venue}</p>}
          <p className="text-xl sm:text-2xl font-bold text-teal-600 mt-4">Official Results & Rankings</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-base sm:text-lg rounded-xl hover:from-blue-600 hover:to-blue-800 active:scale-95 transition-all shadow-lg min-h-[56px] flex items-center justify-center gap-2"
          >
            <span className="text-xl">🖨️</span>
            <span>Print Results</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-base sm:text-lg rounded-xl hover:from-purple-600 hover:to-purple-800 active:scale-95 transition-all shadow-lg min-h-[56px] flex items-center justify-center gap-2"
          >
            <span className="text-xl">📄</span>
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleNewCompetition}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-base sm:text-lg rounded-xl hover:from-teal-600 hover:to-cyan-700 active:scale-95 transition-all shadow-lg min-h-[56px] flex items-center justify-center gap-2"
          >
            <span className="text-xl">🎭</span>
            <span className="hidden sm:inline">New Competition</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Rankings Display */}
        {rankings.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">No scores available yet.</p>
            <p className="text-gray-500 mb-6">Judges need to submit their scores first.</p>
            <button
              onClick={() => navigate('/judge-selection', { state: competitionData })}
              className="py-3 px-6 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
            >
              Go to Judge Selection
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {rankings.map((dancer, index) => {
              const rankInfo = getRankDisplay(dancer.rank);
              
              return (
                <div 
                  key={dancer.id}
                  className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                    selectedDancer?.id === dancer.id ? 'ring-4 ring-teal-400' : ''
                  }`}
                >
                  {/* Main Dancer Info */}
                  <div 
                    className="p-4 sm:p-6 cursor-pointer"
                    onClick={() => setSelectedDancer(selectedDancer?.id === dancer.id ? null : dancer)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${rankInfo.color} rounded-2xl flex flex-col items-center justify-center shadow-lg`}>
                        <span className="text-2xl sm:text-3xl font-bold text-white">{dancer.rank}</span>
                        <span className="text-xs sm:text-sm text-white/90 font-semibold">
                          {dancer.rank === 1 ? 'PLACE' : dancer.rank === 2 ? 'PLACE' : dancer.rank === 3 ? 'PLACE' : 'PLACE'}
                        </span>
                      </div>

                      {/* Dancer Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl sm:text-3xl font-bold text-teal-600">#{dancer.number}</span>
                          <div className="min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{dancer.name}</h3>
                            <p className="text-sm sm:text-base text-gray-600">{dancer.division}</p>
                          </div>
                        </div>

                        {/* Judge Scores */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mt-4">
                          {dancer.judgeScores.map(score => (
                            <div key={score.judgeNum} className="bg-teal-50 rounded-lg p-2 sm:p-3 border-2 border-teal-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Judge {score.judgeNum}</p>
                              <p className="text-lg sm:text-xl font-bold text-teal-600">{score.total.toFixed(1)}</p>
                              <p className="text-xs text-gray-500">/ 100</p>
                            </div>
                          ))}
                          
                          {/* Average Score */}
                          <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg p-2 sm:p-3 text-white col-span-2 sm:col-span-1">
                            <p className="text-xs font-semibold mb-1">AVERAGE</p>
                            <p className="text-xl sm:text-2xl font-bold">{dancer.averageScore.toFixed(2)}</p>
                            <p className="text-xs opacity-90">/ 100</p>
                          </div>
                        </div>

                        {/* Judges who scored */}
                        <p className="text-xs sm:text-sm text-gray-500 mt-3">
                          Scored by {dancer.judgesWhoScored} of {judgeCount} judge{judgeCount > 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0 self-center">
                        <span className="text-2xl text-gray-400">
                          {selectedDancer?.id === dancer.id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {selectedDancer?.id === dancer.id && (
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 border-t-2 border-teal-200">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Category Breakdown</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dancer.judgeScores.map(score => (
                          <div key={score.judgeNum} className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-base sm:text-lg font-bold text-teal-600 mb-3">Judge {score.judgeNum}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">🎯 Technique:</span>
                                <span className="font-bold text-gray-800">{score.technique} / 25</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">✨ Creativity:</span>
                                <span className="font-bold text-gray-800">{score.creativity} / 25</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">🎭 Presentation:</span>
                                <span className="font-bold text-gray-800">{score.presentation} / 25</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">👗 Appearance:</span>
                                <span className="font-bold text-gray-800">{score.appearance} / 25</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                                <span className="text-sm font-bold text-gray-700">TOTAL:</span>
                                <span className="font-bold text-lg text-teal-600">{score.total.toFixed(1)} / 100</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 pb-8 print:block print:mt-12">
          <p className="font-semibold">TOPAZ 2.0 Scoring System © 2025</p>
          <p className="mt-1">Heritage Since 1972 | Official Competition Results</p>
        </div>
      </div>
    </Layout>
  );
}

export default ResultsPage;

