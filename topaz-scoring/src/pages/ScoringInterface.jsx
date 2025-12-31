import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

function ScoringInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const competitionData = location.state || {};
  const { 
    competitionName, 
    dancers = [], 
    selectedJudge,
    competitionDate,
    venue,
    judgeCount 
  } = competitionData;

  // Ready-made image paths for branding
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  // Redirect if no competition data
  useEffect(() => {
    if (!competitionName || !selectedJudge || dancers.length === 0) {
      navigate('/judge-selection');
    }
  }, [competitionName, selectedJudge, dancers, navigate]);

  // Current dancer index
  const [currentDancerIndex, setCurrentDancerIndex] = useState(0);
  
  // Scores state: { dancerId: { technique, creativity, presentation, appearance, total } }
  const [allScores, setAllScores] = useState(() => {
    // Try to load from localStorage
    const savedScores = localStorage.getItem(`scores_judge${selectedJudge}_${competitionName}`);
    if (savedScores) {
      return JSON.parse(savedScores);
    }
    // Initialize empty scores for all dancers
    const initialScores = {};
    dancers.forEach(dancer => {
      initialScores[dancer.id] = {
        technique: '',
        creativity: '',
        presentation: '',
        appearance: '',
        total: 0
      };
    });
    return initialScores;
  });

  // Current dancer
  const currentDancer = dancers[currentDancerIndex];
  const currentScores = currentDancer ? allScores[currentDancer.id] : null;

  // Validation errors
  const [errors, setErrors] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Update score for current dancer
  const updateScore = (category, value) => {
    // Allow empty string or valid number input
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      const newScores = {
        ...allScores,
        [currentDancer.id]: {
          ...allScores[currentDancer.id],
          [category]: value
        }
      };

      // Calculate total
      const scores = newScores[currentDancer.id];
      const total = (
        (parseFloat(scores.technique) || 0) +
        (parseFloat(scores.creativity) || 0) +
        (parseFloat(scores.presentation) || 0) +
        (parseFloat(scores.appearance) || 0)
      );
      newScores[currentDancer.id].total = total;

      setAllScores(newScores);
      
      // Clear error for this field
      if (errors[category]) {
        setErrors({ ...errors, [category]: null });
      }
    }
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`scores_judge${selectedJudge}_${competitionName}`, JSON.stringify(allScores));
  }, [allScores, selectedJudge, competitionName]);

  // Validate current dancer scores
  const validateCurrentScores = () => {
    const newErrors = {};
    const scores = allScores[currentDancer.id];

    if (scores.technique === '' || scores.technique < 0 || scores.technique > 25) {
      newErrors.technique = 'Enter score 0-25';
    }
    if (scores.creativity === '' || scores.creativity < 0 || scores.creativity > 25) {
      newErrors.creativity = 'Enter score 0-25';
    }
    if (scores.presentation === '' || scores.presentation < 0 || scores.presentation > 25) {
      newErrors.presentation = 'Enter score 0-25';
    }
    if (scores.appearance === '' || scores.appearance < 0 || scores.appearance > 25) {
      newErrors.appearance = 'Enter score 0-25';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next dancer
  const handleNext = () => {
    if (validateCurrentScores()) {
      if (currentDancerIndex < dancers.length - 1) {
        setCurrentDancerIndex(currentDancerIndex + 1);
        setErrors({});
      }
    }
  };

  // Navigate to previous dancer
  const handlePrevious = () => {
    if (currentDancerIndex > 0) {
      setCurrentDancerIndex(currentDancerIndex - 1);
      setErrors({});
    }
  };

  // Check if all dancers have been scored
  const allDancersScored = () => {
    return dancers.every(dancer => {
      const scores = allScores[dancer.id];
      return scores.technique !== '' && 
             scores.creativity !== '' && 
             scores.presentation !== '' && 
             scores.appearance !== '' &&
             scores.technique >= 0 && scores.technique <= 25 &&
             scores.creativity >= 0 && scores.creativity <= 25 &&
             scores.presentation >= 0 && scores.presentation <= 25 &&
             scores.appearance >= 0 && scores.appearance <= 25;
    });
  };

  // Submit all scores
  const handleSubmitAll = () => {
    if (!validateCurrentScores()) {
      return;
    }
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    // Format scores for results page
    const formattedScores = dancers.map(dancer => ({
      dancerId: dancer.id,
      dancerNumber: dancer.number,
      dancerName: dancer.name,
      division: dancer.division,
      ...allScores[dancer.id]
    }));

    // Navigate to results page
    navigate('/results', {
      state: {
        competitionName,
        competitionDate,
        venue,
        judgeCount,
        dancers,
        selectedJudge,
        judgeScores: formattedScores
      }
    });
  };

  if (!currentDancer) {
    return null;
  }

  // Calculate progress
  const scoredCount = dancers.filter(dancer => {
    const scores = allScores[dancer.id];
    return scores.technique !== '' && scores.creativity !== '' && 
           scores.presentation !== '' && scores.appearance !== '';
  }).length;

  return (
    <Layout overlayOpacity="bg-white/80">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header with Branding */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 w-full">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure? Scores are saved and can be resumed later.')) {
                navigate('/judge-selection', { state: competitionData });
              }
            }}
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
          
          <div className="text-right z-20">
            <span className="text-teal-600 font-bold text-xs sm:text-base whitespace-nowrap">Judge {selectedJudge}</span>
          </div>
        </div>

        {/* Competition Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{competitionName}</h1>
          <p className="text-base sm:text-lg text-teal-600 font-semibold">Judge {selectedJudge} Scoring</p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-teal-50 rounded-xl p-4 mb-6 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-semibold text-gray-700">
              Dancer {currentDancerIndex + 1} of {dancers.length}
            </span>
            <span className="text-sm sm:text-base text-teal-600 font-semibold">
              {scoredCount} / {dancers.length} Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(scoredCount / dancers.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scoring Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-5 sm:p-8 mb-6">
          {/* Dancer Info */}
          <div className="text-center mb-6 sm:mb-8 pb-6 border-b-2 border-gray-200">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-xl mb-3">
              <span className="text-3xl sm:text-4xl font-bold">#{currentDancer.number}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{currentDancer.name}</h2>
            <p className="text-base sm:text-lg text-gray-600">{currentDancer.division}</p>
          </div>

          {/* Score Categories */}
          <div className="space-y-5 sm:space-y-6 mb-6">
            {/* Technique */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-base sm:text-lg">
                🎯 Technique
                <span className="text-gray-500 font-normal text-sm ml-2">(0-25 points)</span>
              </label>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={currentScores.technique}
                onChange={(e) => updateScore('technique', e.target.value)}
                className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-3 rounded-xl text-xl sm:text-2xl font-semibold focus:outline-none transition-colors min-h-[60px] ${
                  errors.technique ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-teal-500'
                }`}
                placeholder="0.0"
              />
              {errors.technique && (
                <p className="text-red-600 text-sm mt-1 font-semibold">{errors.technique}</p>
              )}
            </div>

            {/* Creativity & Choreography */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-base sm:text-lg">
                ✨ Creativity & Choreography
                <span className="text-gray-500 font-normal text-sm ml-2">(0-25 points)</span>
              </label>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={currentScores.creativity}
                onChange={(e) => updateScore('creativity', e.target.value)}
                className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-3 rounded-xl text-xl sm:text-2xl font-semibold focus:outline-none transition-colors min-h-[60px] ${
                  errors.creativity ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-teal-500'
                }`}
                placeholder="0.0"
              />
              {errors.creativity && (
                <p className="text-red-600 text-sm mt-1 font-semibold">{errors.creativity}</p>
              )}
            </div>

            {/* Presentation */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-base sm:text-lg">
                🎭 Presentation
                <span className="text-gray-500 font-normal text-sm ml-2">(0-25 points)</span>
              </label>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={currentScores.presentation}
                onChange={(e) => updateScore('presentation', e.target.value)}
                className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-3 rounded-xl text-xl sm:text-2xl font-semibold focus:outline-none transition-colors min-h-[60px] ${
                  errors.presentation ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-teal-500'
                }`}
                placeholder="0.0"
              />
              {errors.presentation && (
                <p className="text-red-600 text-sm mt-1 font-semibold">{errors.presentation}</p>
              )}
            </div>

            {/* Appearance & Costume */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-base sm:text-lg">
                👗 Appearance & Costume
                <span className="text-gray-500 font-normal text-sm ml-2">(0-25 points)</span>
              </label>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={currentScores.appearance}
                onChange={(e) => updateScore('appearance', e.target.value)}
                className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-3 rounded-xl text-xl sm:text-2xl font-semibold focus:outline-none transition-colors min-h-[60px] ${
                  errors.appearance ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-teal-500'
                }`}
                placeholder="0.0"
              />
              {errors.appearance && (
                <p className="text-red-600 text-sm mt-1 font-semibold">{errors.appearance}</p>
              )}
            </div>
          </div>

          {/* Total Score Display */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border-3 border-teal-400 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-base sm:text-lg text-gray-600 font-semibold mb-2">TOTAL SCORE</p>
            <p className="text-4xl sm:text-5xl font-bold text-teal-600">
              {currentScores.total.toFixed(1)} <span className="text-2xl sm:text-3xl text-gray-500">/ 100</span>
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentDancerIndex === 0}
            className={`flex-1 py-4 sm:py-5 px-6 font-bold text-lg sm:text-xl rounded-xl transition-all min-h-[60px] ${
              currentDancerIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 active:scale-95'
            }`}
          >
            ← Previous Dancer
          </button>

          {currentDancerIndex < dancers.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-4 sm:py-5 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-lg sm:text-xl rounded-xl hover:from-cyan-600 hover:to-teal-600 active:scale-95 transition-all min-h-[60px]"
            >
              Next Dancer →
            </button>
          ) : (
            <button
              onClick={handleSubmitAll}
              className="flex-1 py-4 sm:py-5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg sm:text-xl rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all min-h-[60px]"
            >
              ✓ Submit All Scores
            </button>
          )}
        </div>

        {/* Quick Jump to Dancer (Optional - for large competitions) */}
        {dancers.length > 5 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Jump:</p>
            <div className="flex flex-wrap gap-2">
              {dancers.map((dancer, index) => {
                const isScored = allScores[dancer.id].technique !== '' && 
                                allScores[dancer.id].creativity !== '' && 
                                allScores[dancer.id].presentation !== '' && 
                                allScores[dancer.id].appearance !== '';
                return (
                  <button
                    key={dancer.id}
                    onClick={() => setCurrentDancerIndex(index)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
                      index === currentDancerIndex
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                        : isScored
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                    }`}
                  >
                    #{dancer.number}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
               onClick={() => setShowSubmitConfirm(false)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Submit All Scores?</h2>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                You have scored all {dancers.length} dancers. Once submitted, you'll be taken to the results page.
              </p>
              <p className="text-teal-600 font-semibold mb-6 text-sm sm:text-base">
                ✓ {dancers.length} dancers scored • Total points entered
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all min-h-[48px]"
                >
                  Submit Scores
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ScoringInterface;

