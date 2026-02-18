// Lorelai Voice Configuration
// ElevenLabs TTS for warm, conversational voice output

export const VOICE_CONFIG = {
  // ElevenLabs settings
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  
  // Voice options — warm female voices from ElevenLabs
  // We'll pick the best one that sounds like a cozy friend, not a robot
  voices: {
    // Rachel — warm, conversational, American female
    rachel: 'g05nQGaHuxwkMQ4QdCqX',
    // Charlotte — warm, British female, soothing
    charlotte: 'ZDQH6e90KXjOAQisPkU0',
    // Aria — natural, friendly female
    aria: '9BWtsMINqrJLrRacOk9x',
  },
  
  // Default voice for Lorelai
  defaultVoice: 'rachel',
  
  // Model — turbo for low latency
  model: 'eleven_turbo_v2_5',
  
  // Voice settings for warm therapy conversation
  voiceSettings: {
    stability: 0.65,        // Slightly varied for natural feel
    similarity_boost: 0.75, // Natural but consistent
    style: 0.35,            // Some expressiveness
    use_speaker_boost: true,
  },
}

// Generate speech from text using ElevenLabs
export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const voiceId = VOICE_CONFIG.voices[VOICE_CONFIG.defaultVoice as keyof typeof VOICE_CONFIG.voices]
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': VOICE_CONFIG.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: VOICE_CONFIG.model,
        voice_settings: VOICE_CONFIG.voiceSettings,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`)
  }

  return response.arrayBuffer()
}
