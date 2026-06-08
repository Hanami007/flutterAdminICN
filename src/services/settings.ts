import { supabase } from '@/lib/supabase';
import type { PlatformSettings } from '@/types/database';

export async function getSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase.from('platform_settings').select('*').single();

  if (error || !data) {
    // Default settings
    return {
      id: '1',
      site_name: 'LearnHub',
      site_description: 'Premium Online Learning Platform',
      logo_url: null,
      favicon_url: null,
      primary_color: '#7C3AED',
      contact_email: 'contact@learnhub.com',
      contact_phone: '+66 2 123 4567',
      address: 'Bangkok, Thailand',
      facebook_url: '',
      twitter_url: '',
      instagram_url: '',
      youtube_url: '',
      linkedin_url: '',
      line_url: '',
      updated_at: new Date().toISOString(),
    };
  }

  return data as PlatformSettings;
}

export async function updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', settings.id || '1')
    .select()
    .single();

  if (error) throw error;
  return data as PlatformSettings;
}
