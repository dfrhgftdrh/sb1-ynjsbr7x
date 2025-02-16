import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ContentItem = Database['public']['Tables']['content_items']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'] & {
  thumbnail_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  about?: string | null;
};