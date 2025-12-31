import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function CompetitionSetup() {
  const navigate = useNavigate();
  
  const [competitionName, setCompetitionName] = useState('');
  const [competitionDate, setCompetitionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [venue, setVenue] = useState('');
  const [judgeCount, setJudgeCount] = useState(3);
  
  const [dancers, setDancers] = useState([]);
  const [showAddDancer, setShowAddDancer] = useState(false);
  const [newDancerName, setNewDancerName] = useState('');
  const [newDancerDivision, setNewDancerDivision] = useState('');
  
  const [errors, setErrors] = useState({});

  // Ready-made image paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  const handleAddDancer = () => {
    if (!newDancerName.trim()) {
      alert('Please enter dancer name');
      return;
    }
    
    const newDancer = {
      id: Date.now(),
      number: dancers.length + 1,
      name: newDancerName.trim(),
      division: newDancerDivision.trim() || 'General'
    };
    
    setDancers([...dancers, newDancer]);
    setNewDancerName('');
    setNewDancerDivision('');
    setShowAddDancer(false);
  };

  const handleDeleteDancer = (id) => {
    if (window.confirm('Remove this dancer?')) {
      const updated = dancers.filter(d => d.id !== id)
        .map((d, index) => ({ ...d, number: index + 1 }));
      setDancers(updated);
    }
  };

  const validateAndContinue = () => {
    const newErrors = {};
    
    if (!competitionName.trim()) {
      newErrors.competitionName = 'Competition name is required';
    }
    
    if (dancers.length === 0) {
      newErrors.dancers = 'Please add at least one dancer';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    navigate('/judge-selection', {
      state: {
        competitionName,
        competitionDate,
        venue,
        judgeCount,
        dancers
      }
    });
  };

  return (
    <Layout overlayOpacity="bg-white/80">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        {/* Header - Integrated with full branding logos */}
        <div className="flex items-center justify-between mb-10 max-w-5xl mx-auto w-full">
          <button 
            onClick={() => navigate('/')}
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
            <span className="text-teal-600 font-bold text-sm sm:text-base whitespace-nowrap">Step 1 / 3</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Competition Setup</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Enter competition details and add dancers</p>

          {/* Competition Details Form - Responsive padding */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-5 sm:mb-6">Competition Details</h2>
            
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Competition Name *
                </label>
                <input
                  type="text"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  placeholder="e.g., TOPAZ Spring Championship 2025"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base sm:text-lg min-h-[48px]"
                />
                {errors.competitionName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.competitionName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    Competition Date *
                  </label>
                  <input
                    type="date"
                    value={competitionDate}
                    onChange={(e) => setCompetitionDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base sm:text-lg min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    Number of Judges *
                  </label>
                  <select
                    value={judgeCount}
                    onChange={(e) => setJudgeCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base sm:text-lg min-h-[48px] bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} Judge{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Venue/Location (Optional)
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g., City Dance Hall"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base sm:text-lg min-h-[48px]"
                />
              </div>
            </div>
          </div>

          {/* Dancers Section - Responsive padding and layout */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-600">Dancers/Teams</h2>
                <p className="text-sm sm:text-base text-gray-600">{dancers.length} dancer{dancers.length !== 1 ? 's' : ''} added</p>
              </div>
              <button
                onClick={() => setShowAddDancer(true)}
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-md min-h-[48px] text-sm sm:text-base"
              >
                + Add Dancer
              </button>
            </div>

            {errors.dancers && (
              <p className="text-red-500 text-xs sm:text-sm mb-4">{errors.dancers}</p>
            )}

            {showAddDancer && (
              <div className="bg-teal-50 p-4 sm:p-6 rounded-lg mb-4 border-2 border-teal-200">
                <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">Add New Dancer</h3>
                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    value={newDancerName}
                    onChange={(e) => setNewDancerName(e.target.value)}
                    placeholder="Dancer/Team Name *"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base min-h-[48px]"
                  />
                  <input
                    type="text"
                    value={newDancerDivision}
                    onChange={(e) => setNewDancerDivision(e.target.value)}
                    placeholder="Division/Category (e.g., Tap Solo, Junior)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base min-h-[48px]"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddDancer}
                      className="flex-1 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors min-h-[48px]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDancer(false);
                        setNewDancerName('');
                        setNewDancerDivision('');
                      }}
                      className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors min-h-[48px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {dancers.map((dancer) => (
                <div 
                  key={dancer.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-300 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl sm:text-2xl font-bold text-teal-600 w-8">#{dancer.number}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{dancer.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{dancer.division}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDancer(dancer.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm min-h-[36px] self-end sm:self-auto"
                  >
                    Delete
                  </button>
                </div>
              ))}
              
              {dancers.length === 0 && !showAddDancer && (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">No dancers added yet. Click "Add Dancer" to begin.</p>
              )}
            </div>
          </div>

          <button
            onClick={validateAndContinue}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-lg sm:text-xl font-bold rounded-xl 
                       hover:from-cyan-600 hover:to-teal-600 active:scale-95 transition-all shadow-lg mb-8 min-h-[56px]"
          >
            Continue to Judge Selection →
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default CompetitionSetup;
