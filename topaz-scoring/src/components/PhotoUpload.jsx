import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';

function PhotoUpload({
  onPhotoSelect,
  existingPhotoUrl = null,
  label = 'Entry Photo (Optional)',
  description = 'Max size: 1MB • Formats: JPG, PNG • Auto-compressed if needed',
}) {
  const [preview, setPreview] = useState(existingPhotoUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (existingPhotoUrl) {
      setPreview(existingPhotoUrl);
    }
  }, [existingPhotoUrl]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG or PNG)');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG formats are supported');
      return;
    }

    try {
      setIsProcessing(true);
      let processedFile = file;

      const fileSizeInMB = file.size / (1024 * 1024);

      if (fileSizeInMB > 1) {
        toast.info('Compressing image...');

        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: 'image/jpeg',
        };

        try {
          processedFile = await imageCompression(file, options);
          const compressedSizeInMB = processedFile.size / (1024 * 1024);
          toast.success(`Image compressed from ${fileSizeInMB.toFixed(2)}MB to ${compressedSizeInMB.toFixed(2)}MB`);
        } catch (compressionError) {
          console.error('Compression error:', compressionError);
          toast.warning('Could not compress image, using original');
          processedFile = file;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(processedFile);

      if (onPhotoSelect) {
        onPhotoSelect(processedFile);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setIsProcessing(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onPhotoSelect) {
      onPhotoSelect(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt=""
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg font-semibold text-white min-h-[44px] transition-colors ${
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Processing...
              </span>
            ) : preview ? (
              '📷 Change Photo'
            ) : (
              '📷 Upload Photo'
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;
