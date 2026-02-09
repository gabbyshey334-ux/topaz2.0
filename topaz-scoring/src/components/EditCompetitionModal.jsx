import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateCompetition } from '../supabase/competitions';
import { getCompetitionCategories, createCategory, deleteCategory } from '../supabase/categories';

/**
 * Edit Competition Modal Component
 * Allows editing competition details after creation
 */
export default function EditCompetitionModal({ 
  competition, 
  isOpen, 
  onClose, 
  onSave 
}) {
  // Form state
  const [competitionName, setCompetitionName] = useState('');
  const [competitionDate, setCompetitionDate] = useState('');
  const [venue, setVenue] = useState('');
  const [judgeCount, setJudgeCount] = useState(3);
  const [judgeNames, setJudgeNames] = useState([]);
  
  // Categories state
  const [existingCategories, setExistingCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  
  // Available categories (same as CompetitionSetup)
  const FIXED_CATEGORIES = [
    { name: 'Tap', color: 'blue' },
    { name: 'Jazz', color: 'purple' },
    { name: 'Ballet', color: 'pink' },
    { name: 'Lyrical/Contemporary', color: 'teal' },
    { name: 'Vocal', color: 'yellow' },
    { name: 'Acting', color: 'orange' },
    { name: 'Hip Hop', color: 'red' }
  ];

  const SPECIAL_CATEGORIES = [
    { name: 'Production', color: 'gray', special: true },
    { name: 'Student Choreography', color: 'green', special: true },
    { name: 'Teacher/Student', color: 'indigo', special: true }
  ];

  const ALL_AVAILABLE_CATEGORIES = [...FIXED_CATEGORIES, ...SPECIAL_CATEGORIES];
  
  const varietyOptions = ['None', 'Variety A', 'Variety B', 'Variety C', 'Variety D', 'Variety E'];

  // Load competition data when modal opens
  useEffect(() => {
    if (isOpen && competition) {
      setCompetitionName(competition.name || '');
      setCompetitionDate(competition.date ? competition.date.split('T')[0] : '');
      setVenue(competition.venue || '');
      setJudgeCount(competition.judges_count || 3);
      setJudgeNames(competition.judge_names || Array(competition.judges_count || 3).fill(''));
      
      // Load existing categories
      loadCategories();
    }
  }, [isOpen, competition]);

  // Load existing categories
  const loadCategories = async () => {
    if (!competition?.id) return;
    
    try {
      const result = await getCompetitionCategories(competition.id);
      if (result.success) {
        setExistingCategories(result.data || []);
        
        // Build selectedCategories object from existing categories
        const selected = {};
        result.data.forEach(cat => {
          // Extract category name and variety level from name
          // Format: "Category Name" or "Category Name - Variety Level"
          const parts = cat.name.split(' - ');
          const categoryName = parts[0];
          const varietyLevel = parts[1] || 'None';
          
          if (!selected[categoryName]) {
            selected[categoryName] = { selected: true, varietyLevels: [] };
          }
          if (!selected[categoryName].varietyLevels.includes(varietyLevel)) {
            selected[categoryName].varietyLevels.push(varietyLevel);
          }
        });
        setSelectedCategories(selected);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Handle judge count change
  const handleJudgeCountChange = (count) => {
    setJudgeCount(count);
    // Resize judgeNames array while preserving existing names
    const newNames = Array.from({ length: count }, (_, i) => judgeNames[i] || '');
    setJudgeNames(newNames);
  };

  // Handle judge name change
  const handleJudgeNameChange = (index, name) => {
    const newNames = [...judgeNames];
    newNames[index] = name;
    setJudgeNames(newNames);
  };

  // Toggle category selection
  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => {
      const newState = { ...prev };
      if (newState[categoryName]) {
        // Toggle off
        delete newState[categoryName];
      } else {
        // Toggle on with default "None" variety
        newState[categoryName] = { selected: true, varietyLevels: ['None'] };
      }
      return newState;
    });
  };

  // Toggle variety level for a category
  const toggleVarietyLevel = (categoryName, varietyLevel) => {
    setSelectedCategories(prev => {
      const newState = { ...prev };
      if (!newState[categoryName]) return newState;
      
      const varietyLevels = [...newState[categoryName].varietyLevels];
      const index = varietyLevels.indexOf(varietyLevel);
      
      if (index > -1) {
        // Remove variety level
        varietyLevels.splice(index, 1);
        // If no variety levels left, remove category
        if (varietyLevels.length === 0) {
          delete newState[categoryName];
        } else {
          newState[categoryName] = { ...newState[categoryName], varietyLevels };
        }
      } else {
        // Add variety level
        varietyLevels.push(varietyLevel);
        newState[categoryName] = { ...newState[categoryName], varietyLevels };
      }
      
      return newState;
    });
  };

  // Validate form
  const validate = async () => {
    const newErrors = {};
    const newWarnings = [];

    if (!competitionName.trim()) {
      newErrors.competitionName = 'Competition name is required';
    }

    if (!competitionDate) {
      newErrors.competitionDate = 'Competition date is required';
    }

    // Check if reducing judge count below existing scores
    // This would require checking scores, which we'll do in the save function
    // For now, just validate the count is valid
    if (judgeCount < 1 || judgeCount > 10) {
      newErrors.judgeCount = 'Judge count must be between 1 and 10';
    }

    setErrors(newErrors);
    
    // Check for categories with entries (warn if removing)
    if (competition?.id) {
      // This will be checked during save
      newWarnings.push('Removing categories that have entries may affect rankings');
    }

    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      // Update competition
      const updateData = {
        name: competitionName.trim(),
        date: competitionDate,
        venue: venue.trim() || null,
        judges_count: judgeCount,
        judge_names: judgeNames.filter(name => name.trim())
      };

      const updateResult = await updateCompetition(competition.id, updateData);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update competition');
      }

      // Update categories
      await updateCategories();

      toast.success('Competition updated successfully!');
      onSave(updateResult.data);
      onClose();
    } catch (error) {
      console.error('Error updating competition:', error);
      toast.error(`Failed to update competition: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update categories (add new, remove deleted)
  const updateCategories = async () => {
    // Build list of desired categories
    const desiredCategories = [];
    Object.keys(selectedCategories).forEach(categoryName => {
      const categoryData = selectedCategories[categoryName];
      categoryData.varietyLevels.forEach(varietyLevel => {
        const categoryFullName = varietyLevel === 'None' 
          ? categoryName 
          : `${categoryName} - ${varietyLevel}`;
        desiredCategories.push(categoryFullName);
      });
    });

    // Get current category names
    const currentCategoryNames = existingCategories.map(cat => cat.name);

    // Find categories to add
    const toAdd = desiredCategories.filter(name => !currentCategoryNames.includes(name));
    
    // Find categories to remove
    const toRemove = existingCategories.filter(cat => !desiredCategories.includes(cat.name));

    // Add new categories
    for (const categoryName of toAdd) {
      const isSpecial = SPECIAL_CATEGORIES.some(c => c.name === categoryName.split(' - ')[0]);
      await createCategory({
        competition_id: competition.id,
        name: categoryName,
        is_special_category: isSpecial
      });
    }

    // Remove deleted categories (with warning if they have entries)
    for (const category of toRemove) {
      // TODO: Check if category has entries before deleting
      // For now, we'll delete and let the database handle foreign key constraints
      await deleteCategory(category.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Competition Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Warnings</h3>
              <ul className="list-disc list-inside text-yellow-700 text-sm">
                {warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Competition Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-teal-600 mb-4">Competition Details</h3>
            
            <div className="space-y-4">
              {/* Competition Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Competition Name *
                </label>
                <input
                  type="text"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  placeholder="e.g., TOPAZ Spring Championship 2025"
                />
                {errors.competitionName && (
                  <p className="text-red-500 text-sm mt-1">{errors.competitionName}</p>
                )}
              </div>

              {/* Date and Judges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Competition Date *
                  </label>
                  <input
                    type="date"
                    value={competitionDate}
                    onChange={(e) => setCompetitionDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                  {errors.competitionDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.competitionDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Number of Judges *
                  </label>
                  <select
                    value={judgeCount}
                    onChange={(e) => handleJudgeCountChange(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Judge' : 'Judges'}
                      </option>
                    ))}
                  </select>
                  {errors.judgeCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.judgeCount}</p>
                  )}
                </div>
              </div>

              {/* Judge Names */}
              <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-100">
                <h4 className="text-lg font-bold text-teal-700 mb-2">⚖️ Judge Names (Optional)</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enter names to display on score sheets and results.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: judgeCount }, (_, i) => (
                    <div key={i}>
                      <label className="block text-gray-600 text-xs font-semibold mb-1 uppercase">
                        Judge {i + 1} Name
                      </label>
                      <input
                        type="text"
                        value={judgeNames[i] || ''}
                        onChange={(e) => handleJudgeNameChange(i, e.target.value)}
                        placeholder={`e.g., Sarah Johnson`}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Venue/Location (Optional)
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  placeholder="e.g., City Dance Hall"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-teal-600 mb-4">Categories</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select categories for this competition. You can add variety levels for each category.
            </p>

            <div className="space-y-4">
              {ALL_AVAILABLE_CATEGORIES.map(category => {
                const isSelected = selectedCategories[category.name]?.selected || false;
                const varietyLevels = selectedCategories[category.name]?.varietyLevels || [];

                return (
                  <div key={category.name} className="border-2 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(category.name)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="font-semibold text-gray-800">{category.name}</span>
                        {category.special && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Special
                          </span>
                        )}
                      </label>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pl-7">
                        <p className="text-xs text-gray-600 mb-2">Variety Levels:</p>
                        <div className="flex flex-wrap gap-2">
                          {varietyOptions.map(variety => (
                            <label key={variety} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={varietyLevels.includes(variety)}
                                onChange={() => toggleVarietyLevel(category.name, variety)}
                                className="w-4 h-4 text-teal-600 rounded"
                              />
                              <span className="text-sm text-gray-700">{variety}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-6 rounded-b-2xl flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

