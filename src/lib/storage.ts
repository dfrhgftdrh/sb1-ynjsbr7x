import { supabase } from './supabase';

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  wallpapers: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['jpg', 'jpeg', 'png', 'webp']
  },
  ringtones: {
    mimeTypes: ['audio/mpeg', 'audio/wav'],
    extensions: ['mp3', 'wav']
  }
};

// Validate file
export const validateFile = async (file: File, type: 'wallpapers' | 'ringtones'): Promise<boolean> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 50MB');
  }

  // Check file type
  if (!ALLOWED_TYPES[type].mimeTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES[type].extensions.join(', ')}`);
  }

  return true;
};

// Generate storage key
export const generateStorageKey = (folder: string, fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const timestamp = Date.now();
  const uniqueId = crypto.randomUUID();
  return `${folder}/${timestamp}-${uniqueId}.${ext}`;
};

// Upload file
export const uploadFile = async (
  file: File,
  folder: 'wallpapers' | 'ringtones',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file
    await validateFile(file, folder);

    // Generate key
    const key = generateStorageKey(folder, file.name);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('content')
      .upload(key, file, {
        cacheControl: '3600',
        contentType: file.type
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(key);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const path = url.split('/').slice(-2).join('/');
    const { error } = await supabase.storage
      .from('content')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (file: File) => {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }
  
  if (file.type.startsWith('audio/')) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve({
          duration: audio.duration,
          size: file.size
        });
      };
      audio.src = URL.createObjectURL(file);
    });
  }

  return { size: file.size };
};