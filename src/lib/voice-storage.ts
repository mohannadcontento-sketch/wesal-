import { getSupabaseService, isSupabaseConfigured } from './supabase/server';

const VOICE_BUCKET = 'voice-messages';
const MAX_VOICE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VOICE_DURATION_SECONDS = 300; // 5 minutes

interface VoiceUploadResult {
  url: string;
  storageType: 'supabase' | 'base64';
  size: number;
}

/**
 * Upload voice data to storage.
 * Uses Supabase Storage if configured, otherwise falls back to base64.
 */
export async function uploadVoice(
  voiceData: string,
  messageId: string,
  roomId: string,
  senderId: string
): Promise<VoiceUploadResult> {
  // Validate data size
  const base64Length = voiceData.length;
  const estimatedBytes = Math.ceil((base64Length * 3) / 4);

  if (estimatedBytes > MAX_VOICE_SIZE_BYTES) {
    throw new Error('حجم الرسالة الصوتية كبير. الحد الأقصى 5 ميجابايت');
  }

  // Try Supabase Storage first
  if (isSupabaseConfigured) {
    try {
      const result = await uploadToSupabase(voiceData, messageId, roomId, senderId);
      return result;
    } catch (error) {
      console.warn('Supabase Storage upload failed, falling back to base64:', error);
    }
  }

  // Fallback: store as base64 in database
  return {
    url: voiceData,
    storageType: 'base64',
    size: estimatedBytes,
  };
}

async function uploadToSupabase(
  voiceData: string,
  messageId: string,
  roomId: string,
  senderId: string
): Promise<VoiceUploadResult> {
  const supabase = getSupabaseService();
  if (!supabase) throw new Error('Supabase client not available');

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.createBucket(VOICE_BUCKET, {
    public: false,
    fileSizeLimit: MAX_VOICE_SIZE_BYTES,
  });
  // Ignore error if bucket already exists
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.warn('Bucket creation warning:', bucketError.message);
  }

  // Extract MIME type and binary data from data URI
  const matches = voiceData.match(/^data:(.+?);base64,(.+)$/);
  if (!matches) throw new Error('Invalid voice data format');

  const mimeType = matches[1];
  const base64Content = matches[2];
  const binaryBuffer = Buffer.from(base64Content, 'base64');

  // Determine file extension
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'm4a' : 'ogg';

  // File path: room/sender/message-date.ext
  const filePath = `${roomId}/${senderId}/${messageId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(VOICE_BUCKET)
    .upload(filePath, binaryBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  // Get signed URL (valid for 1 year)
  const { data: urlData, error: urlError } = await supabase.storage
    .from(VOICE_BUCKET)
    .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year

  if (urlError || !urlData) {
    // Fall back to public URL if signed URL fails
    const { data: publicUrlData } = supabase.storage.from(VOICE_BUCKET).getPublicUrl(filePath);
    return {
      url: publicUrlData.publicUrl,
      storageType: 'supabase',
      size: binaryBuffer.length,
    };
  }

  return {
    url: urlData.signedUrl,
    storageType: 'supabase',
    size: binaryBuffer.length,
  };
}

export { MAX_VOICE_SIZE_BYTES, MAX_VOICE_DURATION_SECONDS };
