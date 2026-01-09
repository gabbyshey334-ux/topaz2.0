import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import PhotoUpload from '../components/PhotoUpload';
import EmptyState from '../components/EmptyState';
import AbilityBadge from '../components/AbilityBadge';
import { 
  createCompetition, 
  createCategory, 
  createAgeDivision, 
  createEntry,
  bulkCreateCategories,
  bulkCreateAgeDivisions,
  bulkCreateEntries
} from '../supabase';
import { uploadEntryPhoto } from '../supabase/photos';

function CompetitionSetup() {
  const navigate = useNavigate();

  // Logo paths
  const logoPath = '/logo.png';
  const leftImagePath = '/left-dancer.png';
  const rightImagePath = '/right-dancer.png';

  // SECTION 1: Competition Details
  const [competitionName, setCompetitionName] = useState('');
  const [competitionDate, setCompetitionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [venue, setVenue] = useState('');
  const [judgeCount, setJudgeCount] = useState(3);

  // SECTION 2: Categories
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('Jazz');
  const [newVarietyLevel, setNewVarietyLevel] = useState('None');

  // SECTION 3: Age Divisions
  const [ageDivisions, setAgeDivisions] = useState([]);
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newMinAge, setNewMinAge] = useState('');
  const [newMaxAge, setNewMaxAge] = useState('');

  // SECTION 4: Entries
  const [entries, setEntries] = useState([]);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    type: 'solo', // 'solo' or 'group'
    name: '',
    categoryId: '',
    ageDivisionId: '',
    abilityLevel: 'Beginning',
    divisionType: 'Solo',
    isMedalProgram: true,
    photoFile: null,
    groupMembers: []
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');

  // UI State
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Bulk Photo Upload State
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Category options
  const categoryOptions = [
    'Jazz', 'Tap', 'Hip Hop', 'Ballet', 'Contemporary', 
    'Lyrical', 'Acro', 'Musical Theater', 'Open'
  ];

  const varietyOptions = [
    'None', 
    'Variety A', 
    'Variety B', 
    'Variety C', 
    'Variety D', 
    'Variety E'
  ];

  // Get variety description for dropdown
  const getVarietyDescription = (variety) => {
    switch (variety) {
      case 'None':
        return 'None (straight category)';
      case 'Variety A':
        return 'Variety A (Song & Dance, Character, or Combination)';
      case 'Variety B':
        return 'Variety B (Dance with Prop)';
      case 'Variety C':
        return 'Variety C (Dance with Acrobatics)';
      case 'Variety D':
        return 'Variety D (Dance with Acrobatics & Prop)';
      case 'Variety E':
        return 'Variety E (Hip Hop with Floor Work & Acrobatics)';
      default:
        return variety;
    }
  };

  // Category colors
  const categoryColors = {
    'Jazz': 'bg-purple-100 text-purple-800 border-purple-300',
    'Tap': 'bg-blue-100 text-blue-800 border-blue-300',
    'Hip Hop': 'bg-orange-100 text-orange-800 border-orange-300',
    'Ballet': 'bg-pink-100 text-pink-800 border-pink-300',
    'Contemporary': 'bg-teal-100 text-teal-800 border-teal-300',
    'Lyrical': 'bg-purple-100 text-purple-700 border-purple-200',
    'Acro': 'bg-red-100 text-red-800 border-red-300',
    'Musical Theater': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Open': 'bg-gray-100 text-gray-800 border-gray-300'
  };

  // Division type options based on entry type
  const getDivisionTypeOptions = (entryType) => {
    if (entryType === 'solo') {
      return ['Solo'];
    } else {
      return ['Duo/Trio', 'Small Group (4-10)', 'Large Group (11+)', 'Production (10+)'];
    }
  };

  // Generate display name for category
  const generateCategoryDisplayName = (catName, varietyLevel) => {
    if (varietyLevel === 'None') {
      return catName;
    } else if (varietyLevel === 'Variety A') {
      return `${catName} Variety A - Song & Dance`;
    } else if (varietyLevel === 'Variety B') {
      return `${catName} Variety B - with Prop`;
    } else if (varietyLevel === 'Variety C') {
      return `${catName} Variety C - with Acrobatics`;
    } else if (varietyLevel === 'Variety D') {
      return `${catName} Variety D - with Acrobatics & Prop`;
    } else if (varietyLevel === 'Variety E') {
      return `${catName} Variety E - with Floor Work & Acrobatics`;
    }
    return catName;
  };

  // ===================================================================
  // CATEGORY HANDLERS
  // ===================================================================

  const handleAddCategory = () => {
    const displayName = generateCategoryDisplayName(newCategoryName, newVarietyLevel);
    
    // Check for duplicates
    const exists = categories.some(
      cat => cat.name === newCategoryName && cat.varietyLevel === newVarietyLevel
    );
    
    if (exists) {
      toast.error('This category and variety combination already exists');
      return;
    }

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      varietyLevel: newVarietyLevel,
      displayName: displayName
    };

    setCategories([...categories, newCategory]);
    toast.success(`Added: ${displayName}`);
  };

  const handleDeleteCategory = (id) => {
    const category = categories.find(c => c.id === id);
    if (!window.confirm(`Delete "${category?.displayName}"? Entries in this category will need to be reassigned.`)) {
      return;
    }
    setCategories(categories.filter(cat => cat.id !== id));
    toast.info('Category deleted');
  };

  // ===================================================================
  // AGE DIVISION HANDLERS
  // ===================================================================

  const handleAddAgeDivision = () => {
    if (!newDivisionName.trim()) {
      toast.error('Please enter division name');
      return;
    }

    const minAge = parseInt(newMinAge);
    const maxAge = parseInt(newMaxAge);

    if (isNaN(minAge) || isNaN(maxAge)) {
      toast.error('Please enter valid ages');
      return;
    }

    if (minAge >= maxAge) {
      toast.error('Min age must be less than max age');
      return;
    }

    // Check for overlaps
    const overlaps = ageDivisions.some(div => {
      return (minAge >= div.minAge && minAge <= div.maxAge) ||
             (maxAge >= div.minAge && maxAge <= div.maxAge) ||
             (minAge <= div.minAge && maxAge >= div.maxAge);
    });

    if (overlaps) {
      toast.error('Age range overlaps with existing division');
      return;
    }

    const newDivision = {
      id: Date.now().toString(),
      name: newDivisionName.trim(),
      minAge: minAge,
      maxAge: maxAge
    };

    setAgeDivisions([...ageDivisions, newDivision]);
    setNewDivisionName('');
    setNewMinAge('');
    setNewMaxAge('');
    toast.success(`Added division: ${newDivision.name}`);
  };

  const handleDeleteAgeDivision = (id) => {
    const division = ageDivisions.find(d => d.id === id);
    if (!window.confirm(`Delete age division "${division?.name}"?`)) {
      return;
    }
    setAgeDivisions(ageDivisions.filter(div => div.id !== id));
    toast.info('Age division deleted');
  };

  // ===================================================================
  // ENTRY HANDLERS
  // ===================================================================

  const handleOpenAddEntry = () => {
    setCurrentEntry({
      type: 'solo',
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      ageDivisionId: ageDivisions.length > 0 ? ageDivisions[0].id : '',
      abilityLevel: 'Beginning',
      divisionType: 'Solo',
      isMedalProgram: true,
      photoFile: null,
      groupMembers: []
    });
    setShowAddEntryModal(true);
  };

  const handleCloseAddEntry = () => {
    setShowAddEntryModal(false);
    setCurrentEntry({
      type: 'solo',
      name: '',
      categoryId: '',
      ageDivisionId: '',
      abilityLevel: 'Beginning',
      divisionType: 'Solo',
      isMedalProgram: true,
      photoFile: null,
      groupMembers: []
    });
    setNewMemberName('');
    setNewMemberAge('');
  };

  const handleEntryTypeChange = (type) => {
    setCurrentEntry({
      ...currentEntry,
      type: type,
      divisionType: type === 'solo' ? 'Solo' : 'Duo/Trio',
      groupMembers: []
    });
  };

  const handleAddGroupMember = () => {
    if (!newMemberName.trim()) {
      toast.error('Please enter member name');
      return;
    }

    const member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      age: newMemberAge ? parseInt(newMemberAge) : null
    };

    setCurrentEntry({
      ...currentEntry,
      groupMembers: [...currentEntry.groupMembers, member]
    });

    setNewMemberName('');
    setNewMemberAge('');
  };

  const handleDeleteGroupMember = (id) => {
    setCurrentEntry({
      ...currentEntry,
      groupMembers: currentEntry.groupMembers.filter(m => m.id !== id)
    });
  };

  const validateGroupMembers = () => {
    const memberCount = currentEntry.groupMembers.length;
    const divType = currentEntry.divisionType;

    if (divType === 'Duo/Trio') {
      return memberCount >= 2 && memberCount <= 3;
    } else if (divType === 'Small Group (4-10)') {
      return memberCount >= 4 && memberCount <= 10;
    } else if (divType === 'Large Group (11+)') {
      return memberCount >= 11;
    } else if (divType === 'Production (10+)') {
      return memberCount >= 10;
    }
    return true;
  };

  const handleSaveEntry = () => {
    // Validation
    if (!currentEntry.name.trim() && currentEntry.type === 'solo') {
      toast.error('Please enter dancer name');
      return;
    }

    if (!currentEntry.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!currentEntry.abilityLevel) {
      toast.error('Please select an ability level');
      return;
    }

    if (currentEntry.type === 'group') {
      if (!validateGroupMembers()) {
        const divType = currentEntry.divisionType;
        if (divType === 'Duo/Trio') {
          toast.error('Duo/Trio must have 2-3 members');
        } else if (divType === 'Small Group (4-10)') {
          toast.error('Small Group must have 4-10 members');
        } else if (divType === 'Large Group (11+)') {
          toast.error('Large Group must have 11+ members');
        } else if (divType === 'Production (10+)') {
          toast.error('Production must have 10+ members');
        }
        return;
      }
    }

    const category = categories.find(c => c.id === currentEntry.categoryId);
    const ageDivision = ageDivisions.find(d => d.id === currentEntry.ageDivisionId);

    const newEntry = {
      id: Date.now().toString(),
      number: entries.length + 1,
      type: currentEntry.type,
      name: currentEntry.name.trim() || `${currentEntry.divisionType} Group`,
      categoryId: currentEntry.categoryId,
      categoryName: category?.displayName || '',
      categoryColor: categoryColors[category?.name] || 'bg-gray-100 text-gray-800',
      ageDivisionId: currentEntry.ageDivisionId || null,
      ageDivisionName: ageDivision?.name || null,
      abilityLevel: currentEntry.abilityLevel,
      divisionType: currentEntry.divisionType,
      isMedalProgram: currentEntry.isMedalProgram,
      photoFile: currentEntry.photoFile,
      photoPreview: currentEntry.photoFile ? URL.createObjectURL(currentEntry.photoFile) : null,
      groupMembers: currentEntry.type === 'group' ? [...currentEntry.groupMembers] : [],
      isExpanded: false
    };

    setEntries([...entries, newEntry]);
    toast.success(`Added: ${newEntry.name}`);
    handleCloseAddEntry();
  };

  const handleDeleteEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    if (!window.confirm(`Are you sure you want to delete "${entry?.name}"? This cannot be undone.`)) {
      return;
    }
    const updatedEntries = entries
      .filter(e => e.id !== id)
      .map((e, index) => ({ ...e, number: index + 1 }));
    setEntries(updatedEntries);
    toast.info('Entry deleted');
  };

  const toggleExpandEntry = (id) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, isExpanded: !e.isExpanded } : e
    ));
  };

  // ===================================================================
  // BULK PHOTO UPLOAD
  // ===================================================================

  const handleBulkPhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      return;
    }

    setIsBulkUploading(true);
    toast.info(`Uploading ${files.length} photos...`);

    const results = {
      success: [],
      failed: []
    };

    for (const file of files) {
      try {
        // Extract entry number from filename (e.g., "1.jpg" -> 1, "Entry_5.png" -> 5)
        const match = file.name.match(/(\d+)/);
        
        if (!match) {
          results.failed.push({ filename: file.name, reason: 'No entry number found in filename' });
          continue;
        }

        const entryNumber = parseInt(match[1]);
        
        // Find entry with this number
        const entry = entries.find(e => e.number === entryNumber);
        
        if (!entry) {
          results.failed.push({ filename: file.name, reason: `Entry #${entryNumber} not found` });
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          results.failed.push({ filename: file.name, reason: 'Not an image file' });
          continue;
        }

        // Update the entry with the photo
        const updatedEntries = entries.map(e => {
          if (e.id === entry.id) {
            return {
              ...e,
              photoFile: file,
              photoPreview: URL.createObjectURL(file)
            };
          }
          return e;
        });

        setEntries(updatedEntries);
        results.success.push({ filename: file.name, entryNumber });

      } catch (error) {
        console.error('Error processing file:', file.name, error);
        results.failed.push({ filename: file.name, reason: error.message });
      }
    }

    setIsBulkUploading(false);

    // Show results
    if (results.success.length > 0) {
      toast.success(`✅ ${results.success.length} photos uploaded successfully!`);
    }

    if (results.failed.length > 0) {
      toast.error(`❌ ${results.failed.length} photos failed to upload`);
      console.log('Failed uploads:', results.failed);
    }

    // Clear the file input
    event.target.value = '';
  };

  // ===================================================================
  // SAVE TO SUPABASE
  // ===================================================================

  const handleSaveAndContinue = async () => {
    // Validation
    const newErrors = {};

    if (!competitionName.trim()) {
      newErrors.competitionName = 'Competition name is required';
    }

    if (categories.length === 0) {
      newErrors.categories = 'Please add at least one category';
    }

    if (entries.length === 0) {
      newErrors.entries = 'Please add at least one dancer or group';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      // Step 1: Create competition
      toast.info('Creating competition...');
      const compResult = await createCompetition({
        name: competitionName.trim(),
        date: competitionDate,
        venue: venue.trim() || null,
        judges_count: judgeCount,
        status: 'active'
      });

      if (!compResult.success) {
        throw new Error(compResult.error);
      }

      const competitionId = compResult.data.id;
      console.log('✅ Competition created:', competitionId);

      // Step 2: Save categories
      toast.info('Saving categories...');
      for (const cat of categories) {
        const catResult = await createCategory({
          competition_id: competitionId,
          name: cat.displayName,
          description: `${cat.name} | ${cat.varietyLevel}`
        });

        if (!catResult.success) {
          throw new Error(catResult.error);
        }

        // Store the Supabase ID back to our local category
        cat.supabaseId = catResult.data.id;
      }
      console.log('✅ Categories saved:', categories.length);

      // Step 3: Save age divisions (if any)
      if (ageDivisions.length > 0) {
        toast.info('Saving age divisions...');
        for (const div of ageDivisions) {
          const divResult = await createAgeDivision({
            competition_id: competitionId,
            name: div.name,
            min_age: div.minAge,
            max_age: div.maxAge
          });

          if (!divResult.success) {
            throw new Error(divResult.error);
          }

          div.supabaseId = divResult.data.id;
        }
        console.log('✅ Age divisions saved:', ageDivisions.length);
      }

      // Step 4: Save entries with photos
      toast.info('Saving entries...');
      for (const entry of entries) {
        // Upload photo first (if exists)
        let photoUrl = null;
        if (entry.photoFile) {
          const photoResult = await uploadEntryPhoto(
            entry.photoFile,
            entry.id, // temp ID
            competitionId
          );

          if (photoResult.success) {
            photoUrl = photoResult.url;
            console.log('✅ Photo uploaded:', photoUrl);
          } else {
            console.error('❌ Photo upload failed:', photoResult.error);
          }
        }

        // Get Supabase category ID
        const category = categories.find(c => c.id === entry.categoryId);
        const categorySupabaseId = category?.supabaseId || null;

        // Get Supabase age division ID (if assigned)
        const ageDivision = ageDivisions.find(d => d.id === entry.ageDivisionId);
        const ageDivisionSupabaseId = ageDivision?.supabaseId || null;

        // Create entry
        const entryResult = await createEntry({
          competition_id: competitionId,
          entry_number: entry.number,
          competitor_name: entry.name,
          category_id: categorySupabaseId,
          age_division_id: ageDivisionSupabaseId,
          ability_level: entry.abilityLevel,
          dance_type: `${entry.divisionType} | ${entry.type} | Medal: ${entry.isMedalProgram} | Members: ${JSON.stringify(entry.groupMembers)}`,
          photo_url: photoUrl
        });

        if (!entryResult.success) {
          throw new Error(entryResult.error);
        }

        console.log('✅ Entry saved:', entry.name);
      }

      // Success!
      toast.success('🎉 Competition created successfully!');
      
      // Navigate to judge selection
      setTimeout(() => {
        navigate('/judge-selection', {
          state: {
            competitionId: competitionId,
            competitionName: competitionName,
            competitionDate: competitionDate,
            venue: venue,
            judgeCount: judgeCount
          }
        });
      }, 1000);

    } catch (error) {
      console.error('❌ Error saving competition:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout overlayOpacity="bg-white/80">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 max-w-6xl mx-auto w-full">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-semibold flex items-center min-h-[44px]"
          >
            ← <span className="hidden sm:inline ml-1">Back</span>
          </button>

          {/* Branding */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="w-8 h-10 xs:w-12 xs:h-16 md:w-16 md:h-20 flex items-center justify-center">
              <img src={leftImagePath} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 flex items-center justify-center">
              <img src={logoPath} alt="TOPAZ 2.0 Logo" className="w-full h-full object-contain" />
            </div>
            <div className="w-8 h-10 xs:w-12 xs:h-16 md:w-16 md:h-20 flex items-center justify-center">
              <img src={rightImagePath} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          <span className="text-teal-600 font-semibold text-sm sm:text-base">Step 1 of 3</span>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Competition Setup</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Set up your competition with categories, age divisions, and entries
          </p>

          {/* SECTION 1: COMPETITION DETAILS */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-5 sm:mb-6">
              Competition Details
            </h2>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    onChange={(e) => setJudgeCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-base sm:text-lg min-h-[48px]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Judge' : 'Judges'}
                      </option>
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

          {/* BULK PHOTO UPLOAD SECTION */}
          <div className="bg-gradient-to-br from-teal-50/90 to-cyan-50/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6 border-2 border-teal-200">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">📸</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-700 mb-2">
                  Bulk Photo Upload (Competition Day)
                </h2>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  Upload multiple photos at once for all entries. Name your files with entry numbers 
                  (e.g., <span className="font-mono bg-white px-2 py-1 rounded text-teal-700">1.jpg</span>, 
                  <span className="font-mono bg-white px-2 py-1 rounded text-teal-700">2.jpg</span>, 
                  <span className="font-mono bg-white px-2 py-1 rounded text-teal-700">3.jpg</span>). 
                  The system will automatically match them to the correct entries.
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-4 sm:p-6 border-2 border-dashed border-teal-300">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  multiple
                  onChange={handleBulkPhotoUpload}
                  disabled={entries.length === 0 || isBulkUploading}
                  id="bulk-photo-upload"
                  className="hidden"
                />
                <label
                  htmlFor="bulk-photo-upload"
                  className={`flex-1 cursor-pointer bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 text-center shadow-lg transform hover:scale-105 min-h-[48px] flex items-center justify-center ${
                    entries.length === 0 || isBulkUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isBulkUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Processing Photos...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      Select Multiple Photos
                    </>
                  )}
                </label>
              </div>

              {entries.length === 0 && (
                <p className="text-amber-600 text-sm mt-3 text-center font-semibold">
                  ⚠️ Please add entries first before uploading photos
                </p>
              )}

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>💡 Tips:</strong>
                </p>
                <ul className="text-xs sm:text-sm text-gray-600 list-disc list-inside space-y-1 mt-2">
                  <li>Rename your photo files to match entry numbers (e.g., 1.jpg for Entry #1)</li>
                  <li>Supported formats: JPG, PNG</li>
                  <li>Photos over 1MB will be automatically compressed</li>
                  <li>You can select all photos at once for faster upload</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 2: CATEGORY BUILDER */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-2">
              Competition Categories
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Add all categories for this competition. Categories can have variety levels.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Category Name
                  </label>
                  <select
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Variety Level
                  </label>
                  <select
                    value={newVarietyLevel}
                    onChange={(e) => setNewVarietyLevel(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                  >
                    {varietyOptions.map(variety => (
                      <option key={variety} value={variety}>
                        {getVarietyDescription(variety)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddCategory}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all min-h-[44px]"
                    aria-label="Add category to competition"
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              {/* Display preview */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Preview:</span>{' '}
                  {generateCategoryDisplayName(newCategoryName, newVarietyLevel)}
                </p>
              </div>

              {/* Added categories */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Added Categories ({categories.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${categoryColors[cat.name]}`}
                      >
                        <span className="font-semibold text-sm">{cat.displayName}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-current hover:opacity-70"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.categories && (
                <p className="text-red-500 text-sm">{errors.categories}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: AGE DIVISION BUILDER */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-2">
              Age Divisions (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Add age divisions to separate rankings by age groups.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Division Name
                  </label>
                  <input
                    type="text"
                    value={newDivisionName}
                    onChange={(e) => setNewDivisionName(e.target.value)}
                    placeholder="e.g., Junior"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={newMinAge}
                    onChange={(e) => setNewMinAge(e.target.value)}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={newMaxAge}
                    onChange={(e) => setNewMaxAge(e.target.value)}
                    placeholder="12"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddAgeDivision}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all min-h-[44px]"
                  >
                    + Add Division
                  </button>
                </div>
              </div>

              {/* Added divisions */}
              {ageDivisions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Added Divisions ({ageDivisions.length}):
                  </p>
                  <div className="space-y-2">
                    {ageDivisions.map(div => (
                      <div
                        key={div.id}
                        className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 px-4 py-2 rounded-lg"
                      >
                        <span className="font-semibold text-blue-800">
                          {div.name} ({div.minAge}-{div.maxAge} years)
                        </span>
                        <button
                          onClick={() => handleDeleteAgeDivision(div.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: ENTRIES */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-600">
                  Dancers & Groups
                </h2>
                <p className="text-sm text-gray-600">Add entries for this competition</p>
              </div>
              <button
                onClick={handleOpenAddEntry}
                disabled={categories.length === 0}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Entry
              </button>
            </div>

            {categories.length === 0 && (
              <p className="text-yellow-600 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg text-sm">
                ⚠️ Please add at least one category before adding entries
              </p>
            )}

            {/* Entries list */}
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        {entry.photoPreview ? (
                          <img
                            src={entry.photoPreview}
                            alt={entry.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                            {entry.type === 'group' ? '👥' : '💃'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800 text-lg">
                              #{entry.number}
                            </span>
                            <span className="font-semibold text-gray-700">
                              {entry.name}
                            </span>
                            {entry.isMedalProgram && (
                              <span className="text-yellow-500 text-lg" title="Medal Program">
                                ⭐
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${entry.categoryColor}`}>
                            {entry.categoryName}
                          </span>
                          {entry.ageDivisionName && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border-2 border-blue-300">
                              {entry.ageDivisionName}
                            </span>
                          )}
                          <AbilityBadge abilityLevel={entry.abilityLevel} size="md" />
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border-2 border-gray-300">
                            {entry.divisionType}
                          </span>
                        </div>

                        {entry.type === 'group' && entry.groupMembers.length > 0 && (
                          <div>
                            <button
                              onClick={() => toggleExpandEntry(entry.id)}
                              className="text-sm text-teal-600 hover:text-teal-800 font-semibold"
                            >
                              {entry.isExpanded ? '▼' : '▶'} Group of {entry.groupMembers.length} members
                            </button>
                            {entry.isExpanded && (
                              <ul className="mt-2 ml-4 text-sm text-gray-600 space-y-1">
                                {entry.groupMembers.map(member => (
                                  <li key={member.id}>
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
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🎭"
                title="No Entries Yet"
                description="Click the '+ Add Entry' button above to add your first dancer or group."
              />
            )}

            {errors.entries && (
              <p className="text-red-500 text-sm mt-3">{errors.entries}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Continue to Judge Selection →'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 pb-8">
            <p className="font-semibold">TOPAZ 2.0 © 2025</p>
            <p className="mt-1">Heritage Since 1972 | Official Competition Setup</p>
          </div>
        </div>
      </div>

      {/* ADD ENTRY MODAL */}
      {showAddEntryModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCloseAddEntry();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 id="modal-title" className="text-2xl font-bold text-gray-800">Add Entry</h3>
              <button
                onClick={handleCloseAddEntry}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              {/* Entry Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
                  Entry Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={currentEntry.type === 'solo'}
                      onChange={() => handleEntryTypeChange('solo')}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">Solo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={currentEntry.type === 'group'}
                      onChange={() => handleEntryTypeChange('group')}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">Group</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {currentEntry.type === 'solo' ? 'Dancer Name *' : 'Group Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={currentEntry.name}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, name: e.target.value })}
                  placeholder={currentEntry.type === 'solo' ? 'Enter dancer name' : 'Enter group name or leave blank'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Category *
                </label>
                <select
                  value={currentEntry.categoryId}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Division */}
              {ageDivisions.length > 0 && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                    Age Division (Optional)
                  </label>
                  <select
                    value={currentEntry.ageDivisionId}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, ageDivisionId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
                  >
                    <option value="">None</option>
                    {ageDivisions.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.name} ({div.minAge}-{div.maxAge} years)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ability Level */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Ability Level *
                </label>
                <select
                  value={currentEntry.abilityLevel}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, abilityLevel: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
                >
                  <option value="Beginning">Beginning (Less than 2 years)</option>
                  <option value="Intermediate">Intermediate (2-4 years)</option>
                  <option value="Advanced">Advanced (5+ years)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {currentEntry.type === 'group' 
                    ? '⚠️ For groups: Select the ability level of your most experienced member'
                    : 'Select based on years of training'}
                </p>
              </div>

              {/* Division Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Division Type *
                </label>
                <select
                  value={currentEntry.divisionType}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, divisionType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[48px]"
                >
                  {getDivisionTypeOptions(currentEntry.type).map(divType => (
                    <option key={divType} value={divType}>
                      {divType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medal Program */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentEntry.isMedalProgram}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, isMedalProgram: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">
                    Include in Medal Program ⭐
                  </span>
                </label>
              </div>

              {/* Photo Upload */}
              <PhotoUpload
                onPhotoSelect={(file) => setCurrentEntry({ ...currentEntry, photoFile: file })}
                existingPhotoUrl={currentEntry.photoFile ? URL.createObjectURL(currentEntry.photoFile) : null}
              />

              {/* Group Members */}
              {currentEntry.type === 'group' && (
                <div className="border-t pt-5">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    Group Members *
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {currentEntry.divisionType === 'Duo/Trio' && 'Add 2-3 members'}
                    {currentEntry.divisionType === 'Small Group (4-10)' && 'Add 4-10 members'}
                    {currentEntry.divisionType === 'Large Group (11+)' && 'Add 11+ members'}
                    {currentEntry.divisionType === 'Production (10+)' && 'Add 10+ members'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Member name"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={newMemberAge}
                        onChange={(e) => setNewMemberAge(e.target.value)}
                        placeholder="Age (optional)"
                        min="0"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddGroupMember}
                    className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-600 transition-colors min-h-[44px] mb-4"
                  >
                    + Add Member
                  </button>

                  {/* Members list */}
                  {currentEntry.groupMembers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Members ({currentEntry.groupMembers.length}):
                      </p>
                      <div className="space-y-2">
                        {currentEntry.groupMembers.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg"
                          >
                            <span className="text-gray-700">
                              {member.name} {member.age && `(${member.age} years)`}
                            </span>
                            <button
                              onClick={() => handleDeleteGroupMember(member.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseAddEntry}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all min-h-[48px]"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CompetitionSetup;
