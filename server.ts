import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize the Gemini SDK
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Endpoint to generate video script with structured JSON schema
  app.post('/api/generate-script', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please set your GEMINI_API_KEY in Settings > Secrets.',
        });
      }

      const { prompt, tone = 'exciting', platform = 'TikTok' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const systemInstruction = 
        `You are an elite automated video scripting engine named FluxAuto. ` +
        `Create a highly viral short-form video script (under 60s) for ${platform} based on the user's prompt. ` +
        `The tone must be: ${tone}. Include dynamic visual cues, hook-first pacing, and perfectly structured captions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'A catchy, highly click-worthy title for the video',
              },
              hook: {
                type: Type.STRING,
                description: 'The first 3 seconds hook to grab attention immediately',
              },
              script: {
                type: Type.ARRAY,
                description: 'An array of video scenes with timings, narration, and visuals description',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: 'Seconds mark, e.g., "0:00 - 0:05"' },
                    narration: { type: Type.STRING, description: 'The exact words being spoken' },
                    visuals: { type: Type.STRING, description: 'Action/Visuals description for rendering' },
                  },
                  required: ['time', 'narration', 'visuals'],
                },
              },
              suggestedMusic: {
                type: Type.STRING,
                description: 'Atmosphere or style of the background tracking music',
              },
              captions: {
                type: Type.STRING,
                description: 'Engaging, clean text caption optimized for video details including emojis',
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 5 trending niche hashtags without the weight symbol #',
              },
            },
            required: ['title', 'hook', 'script', 'suggestedMusic', 'captions', 'hashtags'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Emply response received from Gemini model');
      }

      const parsedData = JSON.parse(responseText);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Gemini API Integration Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate video pipeline script.',
      });
    }
  });

  // Serve static files in production or hook Vite server in development
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[FluxAuto] Full-stack application container active on http://localhost:${port}`);
  });
}

startServer();
