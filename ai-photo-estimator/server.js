/**
 * AI Photo Estimator - Backend Server
 *
 * HOW THIS WORKS:
 * 1. The frontend uploads a house photo to this server
 * 2. This server converts the image to base64 (a text format AI can read)
 * 3. It sends the image to Claude's Vision API with a detailed prompt
 * 4. Claude analyzes the photo and returns structured JSON
 * 5. We send that JSON back to the frontend to display
 *
 * WHY A SERVER?
 * We need this middleman so the Anthropic API key stays on the server
 * and never gets exposed in the browser. If someone saw your API key
 * in browser code, they could use it and rack up charges on your account.
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk').default;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// --- Middleware Setup ---
// cors() lets the frontend talk to this server even if they're on different ports
app.use(cors());
// express.json() lets us receive JSON data in request bodies
app.use(express.json());
// Serve the frontend files (index.html, etc.) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// --- File Upload Setup ---
// multer handles file uploads. We store in memory (RAM) since we just
// need to convert to base64 and send to the API — no need to save to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max — most phone photos are under 10MB
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  }
});

// --- Claude API Client ---
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * THE ANALYSIS PROMPT
 *
 * This is the most important part of the whole project. The prompt tells
 * Claude exactly what to look for and how to format the response.
 *
 * IMPORTANT: We do NOT include any pricing info here. This just extracts
 * property characteristics. Pricing logic lives in MyBidQuick's engine.
 */
const ANALYSIS_PROMPT = `You are an expert property analyst for exterior cleaning services. Analyze this photo of a property and extract detailed information that would be needed to estimate house washing, window cleaning, and gutter cleaning services.

Return your analysis as a JSON object with EXACTLY this structure. Be as accurate as possible based on what you can see. If you cannot determine something from the photo, use your best estimate and set the confidence to "low".

{
  "property_overview": {
    "stories": <number: 1, 1.5, 2, 2.5, or 3>,
    "stories_confidence": "<high|medium|low>",
    "estimated_sqft": <number: rough estimate of home square footage>,
    "sqft_confidence": "<high|medium|low>",
    "property_type": "<single_family|townhouse|condo|duplex|commercial>",
    "overall_condition": "<excellent|good|fair|poor>",
    "notes": "<any important observations about the property>"
  },
  "house_wash": {
    "siding_type": "<vinyl|aluminum|brick|stucco|wood|hardie_board|stone|mixed>",
    "siding_confidence": "<high|medium|low>",
    "siding_condition": "<clean|light_buildup|moderate_buildup|heavy_buildup>",
    "visible_issues": ["<list any visible issues: mold, mildew, algae, dirt, cobwebs, oxidation, stains>"],
    "difficulty_factors": ["<list factors that increase difficulty: height, landscaping_obstacles, delicate_surfaces, steep_terrain>"],
    "recommendation": "<standard|premium|platinum>",
    "recommendation_reason": "<why you chose this tier>"
  },
  "windows": {
    "estimated_count": <number: total windows visible or estimated>,
    "count_confidence": "<high|medium|low>",
    "window_types": {
      "standard": <number>,
      "large_picture": <number>,
      "french_door": <number>,
      "skylights": <number>,
      "other": <number>
    },
    "stories_with_windows": [<list which floors have windows: 1, 2, 3>],
    "window_condition": "<clean|light_film|moderate_dirt|heavy_buildup>",
    "has_screens": "<yes|no|some|unknown>",
    "difficulty_factors": ["<list factors: high_access, landscaping_blocking, storm_windows>"],
    "recommendation": "<standard|premium|platinum>",
    "recommendation_reason": "<why you chose this tier>"
  },
  "gutters": {
    "has_gutters": <boolean>,
    "gutter_material": "<aluminum|copper|vinyl|steel|unknown>",
    "gutter_condition": "<good|fair|poor|unknown>",
    "visible_debris": <boolean>,
    "estimated_linear_feet": <number or null if can't estimate>,
    "has_gutter_guards": "<yes|no|partial|unknown>",
    "downspout_count": <number or null>,
    "difficulty_factors": ["<list factors: height, roof_pitch, access_issues>"],
    "recommendation": "<standard|premium|platinum>",
    "recommendation_reason": "<why you chose this tier>"
  },
  "ai_summary": "<A 2-3 sentence plain English summary of the property and what services you'd recommend, written as if talking to the cleaning company owner — NOT the customer>"
}

RULES:
- Be thorough but honest about confidence levels
- If the photo only shows one side of the house, estimate the full property based on what's visible
- The recommendation tiers mean: standard = basic service, premium = thorough service, platinum = deep clean + extras
- Base recommendations on the condition you observe
- Do NOT include any pricing, dollar amounts, or rates
- Return ONLY the JSON object, no other text`;

// --- API Endpoint ---
app.post('/api/analyze', upload.single('photo'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    console.log(`Analyzing photo: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Convert the image buffer to base64
    // Base64 is a way to represent binary data (like an image) as text,
    // which is how we send images to AI APIs
    const base64Image = req.file.buffer.toString('base64');

    // Determine the media type (jpeg, png, etc.)
    const mediaType = req.file.mimetype;

    // Send to Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract the text response from Claude
    const rawText = response.content[0].text;

    // Parse the JSON from Claude's response
    // Sometimes Claude wraps JSON in ```json blocks, so we strip those
    let cleanJson = rawText;
    if (cleanJson.includes('```')) {
      cleanJson = cleanJson.replace(/```json?\n?/g, '').replace(/```/g, '');
    }
    cleanJson = cleanJson.trim();

    const analysis = JSON.parse(cleanJson);

    // Return the analysis plus some metadata
    res.json({
      success: true,
      analysis,
      metadata: {
        filename: req.file.originalname,
        filesize: req.file.size,
        model: 'claude-sonnet-4-20250514',
        analyzed_at: new Date().toISOString(),
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);

    // Give helpful error messages
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid or missing Anthropic API key. Check your .env file.' });
    }
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid JSON. Try again with a clearer photo.' });
    }
    res.status(500).json({ error: error.message || 'Something went wrong analyzing the photo' });
  }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🏠 AI Photo Estimator running at http://localhost:${PORT}`);
  console.log(`📸 Upload a house photo to get an instant analysis!\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: No ANTHROPIC_API_KEY found in .env file!');
    console.warn('   Copy .env.example to .env and add your key.\n');
  }
});
