
export async function generateImage(prompt: string): Promise<Buffer | null> {
  // Only using Gemini for image generation
  // Higgsfield and Hugging Face removed as per user request

  // Support multiple API keys for rotation (comma-separated in env)
  const apiKeysRaw = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const apiKeys = apiKeysRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (apiKeys.length === 0) {
    console.log("⚠️ No Gemini API Key found. Skipping image generation.");
    return null;
  }

  const MAX_RETRIES = 5; // Increased retries for stability
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      
      // Rotate API keys to spread load
      const GEMINI_KEY = apiKeys[(attempt - 1) % apiKeys.length];
      
      // Enforce the Authentic Business Editorial style
      const styleEnforcement = " Style: High-End Business Editorial Photography, authentic, trusted, natural lighting, real materials, premium textures. CRITICAL: NO 3D renders, NO abstract art, NO cartoons, NO text.";
      const finalPrompt = prompt + styleEnforcement;
      
      console.log(`🎨 Generating image (Attempt ${attempt}/${MAX_RETRIES}, Key ${((attempt - 1) % apiKeys.length) + 1}/${apiKeys.length})...`);
      console.log(`📝 Image Prompt: ${finalPrompt.substring(0, 200)}...`);

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_KEY}`;
      
      // Add timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60s timeout

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: finalPrompt }]
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data || p.inlineData);
        const imageData = part?.inline_data?.data || part?.inlineData?.data;

        if (imageData) {
          console.log("✅ Image generated successfully.");
          return Buffer.from(imageData, 'base64');
        } else {
          console.log("⚠️ Gemini response missing image data.");
          console.log("🔍 Full Response:", JSON.stringify(data, null, 2));
        }
      } else {
        console.log(`⚠️ Gemini Image Gen failed (${response.status}): ${response.statusText}`);
        
        if (response.status === 429 || response.status === 503) {
          // Rate limit or Service Unavailable - Exponential Backoff
          // 1st retry: 20s, 2nd: 40s, 3rd: 80s, 4th: 160s
          const waitTime = 20000 * Math.pow(2, attempt - 1);
          console.log(`⏳ Rate limited (429/503). Waiting ${waitTime / 1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry immediately after wait
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("⚠️ Image generation timed out.");
      } else {
        console.log("⚠️ Gemini Error:", error.message);
      }
    }

    // Standard wait for other errors
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("❌ Failed to generate image after all retries.");
  return null;
}
