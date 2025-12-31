import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/Layout';

function JudgeSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const competitionData = location.state || {};
  const { competitionName, judgeCount = 3, dancers = [] } = competitionData;

  useEffect(() => {
    if (!competitionName) {
      navigate('/setup');
    }
  }, [competitionName, navigate]);

  // Ready-made image paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  const handleJudgeSelect = (judgeNumber) => {
    navigate('/scoring', {
      state: {
        ...competitionData,
        selectedJudge: judgeNumber
      }
    });
  };

  const handleAdminView = () => {
    navigate('/results', {
      state: {
        ...competitionData,
        isAdmin: true
      }
    });
  };

  return (
    <Layout overlayOpacity="bg-white/80">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        {/* Header - Integrated with full branding logos */}
        <div className="flex items-center justify-between mb-10 max-w-5xl mx-auto w-full">
          <button 
            onClick={() => navigate('/setup', { state: competitionData })}
            className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-semibold flex items-center min-h-[44px] z-20"
          >
            ← <span className="hidden sm:inline ml-1">Back</span>
          </button>
          
          {/* Header Branding - Horizontal Three Logos */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 animate-fade-in flex-1 px-4">
            <div className="w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center">
              <img 
                src={leftImagePath} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-2xl sm:text-3xl opacity-40">🩰</span>';
                  }
                }}
              />
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <img 
                src={logoPath} 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-3xl sm:text-4xl opacity-40">🎭</span>';
                  }
                }}
              />
            </div>
            <div className="w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center">
              <img 
                src={rightImagePath} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = '<span class="text-2xl sm:text-3xl opacity-40">💃</span>';
                  }
                }}
              />
            </div>
          </div>
          
          <div className="text-right z-20">
            <span className="text-teal-600 font-bold text-sm sm:text-base whitespace-nowrap">Step 2 / 3</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 px-4">Judge Selection</h1>
            <p className="text-lg sm:text-xl text-teal-600 font-semibold px-4 line-clamp-2">{competitionName}</p>
            <p className="text-sm sm:text-base text-gray-600 mt-2 px-4">{dancers.length} dancers • {judgeCount} judges</p>
          </div>

          <h2 className="text-xl sm:text-2xl text-gray-700 mb-6 sm:mb-8">Who will be scoring?</h2>

          {/* Grid - 1 col for tiny screens, 2 for mobile/small tablet, 3 for iPad/Desktop */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 px-4">
            {Array.from({ length: judgeCount }, (_, i) => i + 1).map((judgeNum) => (
              <button
                key={judgeNum}
                onClick={() => handleJudgeSelect(judgeNum)}
                className="aspect-[4/3] sm:aspect-square bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl 
                           flex flex-col items-center justify-center p-4 sm:p-6
                           hover:from-cyan-500 hover:to-teal-600 active:scale-95 
                           transition-all shadow-xl hover:shadow-2xl min-h-[120px]"
              >
                <span className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3">🎭</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">Judge {judgeNum}</span>
              </button>
            ))}
          </div>

          {/* Admin Section - Responsive sizing and padding */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-200 px-4">
            <p className="text-sm sm:text-base text-gray-600 mb-4">Competition Administrator</p>
            <button
              onClick={handleAdminView}
              className="w-full max-w-xs sm:max-w-md mx-auto py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-800 
                         text-white text-lg sm:text-xl font-bold rounded-xl 
                         hover:from-blue-700 hover:to-blue-900 active:scale-95 
                         transition-all shadow-lg flex items-center justify-center gap-3 min-h-[56px]"
            >
              <span className="text-xl sm:text-2xl">⚙️</span>
              <span>Admin View</span>
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">View all scores and manage competition</p>
          </div>

          {/* Guidelines Section - Optimized for small screens */}
          <div className="mt-8 sm:mt-12 mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 max-w-2xl mx-auto border-2 border-teal-200 mx-4">
            <p className="text-teal-800 text-sm sm:text-base text-left">
              <span className="inline-block mr-1">👉</span> <strong>Judges:</strong> Select your judge number to begin scoring.
            </p>
            <p className="text-teal-800 text-sm sm:text-base mt-2 text-left">
              <span className="inline-block mr-1">👉</span> <strong>Admin:</strong> Use Admin View to see rankings and results.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JudgeSelection;
