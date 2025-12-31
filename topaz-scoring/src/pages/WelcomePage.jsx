import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function WelcomePage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  // Ready-made image paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

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

        {/* Action Buttons - Touch friendly and responsive width */}
        <div className="flex flex-col gap-4 w-full max-w-[280px] sm:max-w-md px-4">
          <button
            onClick={() => navigate('/setup')}
            className="w-full py-4 sm:py-5 px-6 sm:px-8 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-lg sm:text-xl font-bold rounded-xl 
                       hover:from-cyan-600 hover:to-teal-600 active:scale-95 transition-all shadow-lg 
                       hover:shadow-cyan-500/50 min-h-[56px]"
          >
            🎭 Start New Competition
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
