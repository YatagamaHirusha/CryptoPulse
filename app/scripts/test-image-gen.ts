
import dotenv from 'dotenv';
import { generateImage } from './news-bot/image';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Load .env as fallback

async function testImageGen() {
  console.log("🧪 Testing Image Generation (Creative Business Editorial Style)...");
  
  // Test with a creative, descriptive prompt
  const prompt = "A wide shot of a modern, glass-walled conference room at dusk, overlooking a rainy city skyline with blurred city lights. Inside, a silhouette of a professional stands looking out the window, contemplating. The atmosphere is serious and high-stakes. Cinematic lighting, reflection on the glass, high-end architectural photography.";
  console.log(`📝 Prompt: ${prompt}`);

  try {
    const imageBuffer = await generateImage(prompt);

    if (imageBuffer) {
      console.log("✅ Image generated successfully!");
      const outputPath = path.join(process.cwd(), 'test-image.png');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`💾 Saved to ${outputPath}`);
    } else {
      console.log("❌ Image generation returned null.");
    }
  } catch (error) {
    console.error("💥 Error during test:", error);
  }
}

testImageGen();
