import { useState } from 'react';
import { validateFile, uploadFile, deleteFile } from '../storage';
import type { ContentItem } from '../types';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, options: { folder: 'wallpapers' | 'ringtones' }) => {
    try {
      setUploading(true);
      setError(null);

      // Upload file
      const url = await uploadFile(file, options.folder, (progress) => {
        setProgress(progress);
      });

      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const remove = async (item: ContentItem) => {
    try {
      setUploading(true);
      setError(null);
      await deleteFile(item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    upload,
    remove,
    uploading,
    progress,
    error
  };
}