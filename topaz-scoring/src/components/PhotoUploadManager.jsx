import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCompetitionEntries, updateEntry } from '../supabase/entries';
import { uploadEntryPhoto, compressImage } from '../supabase/photos';
import LoadingSpinner from './LoadingSpinner';

function PhotoUploadManager({ competitionId, onClose }) {
  const [entries, setEntries] = useState([]);
  const [entriesWithoutPhotos, setEntriesWithoutPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileMatches, setFileMatches] = useState([]);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadingIndividual, setUploadingIndividual] = useState({});
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0 });
  const [showPreview, setShowPreview] = useState(false);

  // Load entries
  useEffect(() => {
    loadEntries();
  }, [competitionId]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const result = await getCompetitionEntries(competitionId);
      
      if (result.success) {
        setEntries(result.data);
        // Filter entries without photos
        const withoutPhotos = result.data.filter(e => !e.photo_url || e.photo_url === '');
        setEntriesWithoutPhotos(withoutPhotos);
      } else {
        toast.error('Failed to load entries');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Error loading entries');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk file selection
  const handleBulkFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setSelectedFiles(files);
    
    // Match files to entries
    const matches = files.map(file => {
      // Extract entry number from filename
      const match = file.name.match(/(\d+)/);
      const entryNumber = match ? parseInt(match[1]) : null;
      
      // Find matching entry
      const entry = entriesWithoutPhotos.find(e => e.entry_number === entryNumber);
      
      return {
        file,
        entryNumber,
        entry,
        matched: !!entry,
        status: 'pending'
      };
    });
    
    setFileMatches(matches);
    setShowPreview(true);
  };

  // Upload all matched photos
  const handleBulkUpload = async () => {
    const matchedFiles = fileMatches.filter(m => m.matched);
    
    if (matchedFiles.length === 0) {
      toast.error('No matched files to upload');
      return;
    }

    setUploadingBulk(true);
    setUploadProgress({ uploaded: 0, total: matchedFiles.length });

    const results = {
      success: [],
      failed: []
    };

    for (const match of matchedFiles) {
      try {
        // Compress image if needed
        let fileToUpload = match.file;
        if (match.file.size > 1024 * 1024) { // > 1MB
          const compressed = await compressImage(match.file);
          fileToUpload = compressed;
        }

        // Upload to Supabase storage
        const uploadResult = await uploadEntryPhoto(
          fileToUpload,
          match.entry.id,
          competitionId
        );

        if (uploadResult.success) {
          // Update entry with photo URL
          const updateResult = await updateEntry(match.entry.id, {
            photo_url: uploadResult.url
          });

          if (updateResult.success) {
            results.success.push(match);
            setUploadProgress(prev => ({ ...prev, uploaded: prev.uploaded + 1 }));
          } else {
            results.failed.push({ ...match, error: 'Failed to update entry' });
          }
        } else {
          results.failed.push({ ...match, error: uploadResult.error });
        }
      } catch (error) {
        console.error('Upload error:', error);
        results.failed.push({ ...match, error: error.message });
      }
    }

    setUploadingBulk(false);

    // Show results
    if (results.success.length > 0) {
      toast.success(`✅ ${results.success.length} photos uploaded successfully!`);
      await loadEntries(); // Reload entries
      setShowPreview(false);
      setSelectedFiles([]);
      setFileMatches([]);
    }

    if (results.failed.length > 0) {
      toast.error(`❌ ${results.failed.length} photos failed to upload`);
      console.log('Failed uploads:', results.failed);
    }
  };

  // Handle individual photo upload
  const handleIndividualUpload = async (entry, file) => {
    if (!file) return;

    setUploadingIndividual(prev => ({ ...prev, [entry.id]: true }));

    try {
      // Compress if needed
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        const compressed = await compressImage(file);
        fileToUpload = compressed;
      }

      // Upload to storage
      const uploadResult = await uploadEntryPhoto(
        fileToUpload,
        entry.id,
        competitionId
      );

      if (uploadResult.success) {
        // Update entry
        const updateResult = await updateEntry(entry.id, {
          photo_url: uploadResult.url
        });

        if (updateResult.success) {
          toast.success(`Photo uploaded for ${entry.competitor_name}`);
          await loadEntries();
        } else {
          toast.error('Failed to update entry');
        }
      } else {
        toast.error(`Upload failed: ${uploadResult.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploadingIndividual(prev => ({ ...prev, [entry.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <LoadingSpinner />
          <p className="text-center text-gray-600 mt-4">Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">📸 Photo Upload Manager</h2>
              <p className="text-white/90">Competition Day - Quick Photo Upload</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <span className="text-3xl">×</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 border-b-2 border-amber-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-black text-teal-600">{entries.length}</div>
              <div className="text-sm text-gray-600 font-semibold">Total Entries</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-black text-orange-600">{entriesWithoutPhotos.length}</div>
              <div className="text-sm text-gray-600 font-semibold">Missing Photos</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-black text-green-600">{entries.length - entriesWithoutPhotos.length}</div>
              <div className="text-sm text-gray-600 font-semibold">Photos Uploaded</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {entriesWithoutPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">All Photos Uploaded!</h3>
              <p className="text-gray-600">Every entry has a photo. Great job! 🎉</p>
            </div>
          ) : (
            <>
              {/* BULK UPLOAD SECTION */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-teal-200">
                <h3 className="text-xl font-bold text-teal-800 mb-2 flex items-center gap-2">
                  <span>📤</span> Bulk Photo Upload
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Upload multiple photos at once. Name files as: <span className="font-mono bg-white px-2 py-1 rounded">5.jpg</span> for Entry #5
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleBulkFileSelect}
                  id="bulk-upload"
                  className="hidden"
                  disabled={uploadingBulk}
                />
                
                <label
                  htmlFor="bulk-upload"
                  className={`block w-full cursor-pointer bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all text-center shadow-lg ${
                    uploadingBulk ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {uploadingBulk ? 'Uploading...' : '📁 Select Multiple Photos'}
                </label>

                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-2">💡 Tips:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>Rename files to match entry numbers (e.g., 1.jpg, 2.jpg, 3.jpg)</li>
                    <li>Supported formats: JPG, PNG</li>
                    <li>Photos over 1MB will be automatically compressed</li>
                    <li>You can select all photos at once for faster upload</li>
                  </ul>
                </div>
              </div>

              {/* PREVIEW MATCHES */}
              {showPreview && fileMatches.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Preview Matches</h3>
                  
                  <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                    {fileMatches.map((match, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          match.matched ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{match.matched ? '✓' : '⚠️'}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{match.file.name}</p>
                            <p className="text-sm text-gray-600">
                              {match.matched ? (
                                <>Entry #{match.entry.entry_number}: {match.entry.competitor_name}</>
                              ) : (
                                <>No match found - Entry #{match.entryNumber || '?'} doesn't exist</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {(match.file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    ))}
                  </div>

                  {uploadingBulk && (
                    <div className="mb-4 bg-teal-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-teal-800">Uploading...</span>
                        <span className="text-sm font-bold text-teal-600">
                          {uploadProgress.uploaded} / {uploadProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        setSelectedFiles([]);
                        setFileMatches([]);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                      disabled={uploadingBulk}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                      disabled={uploadingBulk || fileMatches.filter(m => m.matched).length === 0}
                    >
                      {uploadingBulk ? (
                        <>Uploading {uploadProgress.uploaded}/{uploadProgress.total}...</>
                      ) : (
                        <>Upload {fileMatches.filter(m => m.matched).length} Photos</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* INDIVIDUAL UPLOAD SECTION */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Individual Photo Upload ({entriesWithoutPhotos.length} entries)
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {entriesWithoutPhotos.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                          {entry.dance_type && !entry.dance_type.includes('Solo') ? '👥' : '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            #{entry.entry_number} {entry.competitor_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {entry.dance_type || 'Solo'} • Age {entry.age}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          id={`upload-${entry.id}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleIndividualUpload(entry, e.target.files[0]);
                            }
                          }}
                          disabled={uploadingIndividual[entry.id]}
                        />
                        <label
                          htmlFor={`upload-${entry.id}`}
                          className={`cursor-pointer px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors inline-flex items-center gap-2 ${
                            uploadingIndividual[entry.id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingIndividual[entry.id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              📷 Upload Photo
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Tip: Use bulk upload for fastest results on competition day
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadManager;

