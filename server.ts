import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Server-side State memory store for synchronization
let serverState = {
  businessInfo: {
    name: "DentalCare Austin",
    niche: "Dental Clinics and Orthodontists",
    website: "dentalcareaustin.com",
    targetAudience: "Busy families and local professionals looking for premium cosmetic dentistry",
    toneOfVoice: "Authoritative, compassionate, extremely clean and precise"
  },
  platform: "WhatsApp",
  activeModes: ["lead_finder", "outreach", "social_content", "revenue_reporter"],
  heartbeat: "4h",
  notifications: "both",
  status: "Active",
  leads: [
    {
      id: "1",
      name: "Emma Larson",
      company: "Apex Dental Care",
      niche: "Cosmetic Dentistry",
      email: "emma.l@apexdental.com",
      linkedin: "linkedin.com/in/emma-larson-apex",
      source: "Google Maps Scrape",
      budgetSignal: "High",
      notes: "Missing online scheduling, running active campaigns on Meta.",
      status: "approved",
      address: "901 E 5th St, Austin, TX 78702",
      lat: 30.2635,
      lng: -97.7303
    },
    {
      id: "2",
      name: "Marcus Vance",
      company: "Vance Orthodontics",
      niche: "Orthodontics",
      email: "marcus.v@vanceortho.com",
      linkedin: "linkedin.com/in/marcus-vance-ortho",
      source: "Facebook Groups",
      budgetSignal: "Medium",
      notes: "Posted looking for website optimization recommendations.",
      status: "warm",
      address: "1301 W 38th St, Austin, TX 78705",
      lat: 30.3065,
      lng: -97.7441
    }
  ],
  approvals: [
    {
      id: "1",
      type: "lead",
      title: "Approve Lead: Apex Dental Care",
      description: "Emma Larson (Lead Finder found high-intent budget signals: Active Ads running, missing live calendar booking). Reply 'Approve' to outreach.",
      metadata: {
        company: "Apex Dental Care",
        linkedin: "linkedin.com/in/emma-larson-apex",
        source: "Google Maps Scrape",
        niche: "Cosmetic Dentistry",
        budgetSignal: "High (Running Google Ads)"
      },
      timestamp: "06:15 AM",
      status: "pending"
    },
    {
      id: "2",
      type: "social_post",
      title: "Approve LinkedIn Draft",
      description: "Drafted daily post focused on local dentist marketing tips. Ready to queue for automated publishing.",
      metadata: {
        content: "Did you know that 78% of local patients book dentists online during off-hours? If your practice doesn't have an automated calendar system or chatbot, you are directly gifting patients to competitors down the street. It's time to build digital infrastructure! #DentalMarketing #LocalAgency #DentistAustin"
      },
      timestamp: "05:00 AM",
      status: "pending"
    },
    {
      id: "3",
      type: "calendar_confirm",
      title: "Confirm Booking: Dr. Marcus Vance",
      description: "Dr. Marcus Vance requested a demo call via Calendly link after Outreach follow-up sequence. Select to validate.",
      metadata: {
        time: "Tomorrow, 2:30 PM CST",
        email: "contact@vanceortho.com"
      },
      timestamp: "Yesterday",
      status: "pending"
    }
  ],
  activityLog: [
    {
      id: "1",
      timestamp: "07:05 AM",
      title: "Revenue Report Compiled",
      description: "Checked JVZoo and Stripe APIs. Logged $222.00 across 6 sales. Dispatch message scheduled via WhatsApp.",
      status: "success"
    },
    {
      id: "2",
      timestamp: "06:15 AM",
      title: "Completed Austin Dental Scan",
      description: "Scraped 34 cosmetic clinics in Austin. Identified 3 high-intent targets with missing appointment booking widgets.",
      status: "success"
    },
    {
      id: "3",
      timestamp: "Yesterday",
      title: "Published LinkedIn Post",
      description: "Autonomous content successfully validated and published to linked profile: 'Why busy local business owners require execution agents in 2026...'",
      status: "success"
    }
  ],
  telegramBotToken: "",
  telegramBotUsername: "",
  telegramWebhookActive: false
};

// GET current state
app.get("/api/dashboard-state", (req, res) => {
  res.json(serverState);
});

// POST update state
app.post("/api/dashboard-state", (req, res) => {
  const updates = req.body;
  if (updates.businessInfo) serverState.businessInfo = { ...serverState.businessInfo, ...updates.businessInfo };
  if (updates.platform) serverState.platform = updates.platform;
  if (updates.activeModes) serverState.activeModes = updates.activeModes;
  if (updates.heartbeat) serverState.heartbeat = updates.heartbeat;
  if (updates.notifications) serverState.notifications = updates.notifications;
  if (updates.status) serverState.status = updates.status;
  if (updates.leads) serverState.leads = updates.leads;
  if (updates.approvals) serverState.approvals = updates.approvals;
  if (updates.activityLog) serverState.activityLog = updates.activityLog;
  if (updates.telegramBotToken !== undefined) serverState.telegramBotToken = updates.telegramBotToken;
  if (updates.telegramBotUsername !== undefined) serverState.telegramBotUsername = updates.telegramBotUsername;
  
  res.json({ success: true, state: serverState });
});

// AI Persona generator for Step 1
app.post("/api/generate-persona", async (req, res) => {
  const { name, niche } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Business name required" });
  }

  const systemInstruction = `You are an expert brand developer and business strategist.
Based on the business name and optionally current niche, generate a complete tailored marketing profile.
Return EXACTLY a JSON object matching this schema:
{
  "niche": "Detailed niche or industry focus (e.g., 'Residential Solar Installations', 'Orthodontic Dental Practices')",
  "targetAudience": "A refined, specific target audience description defining demographics and core pain points (e.g., 'Homeowners in sunny zip codes facing high utility bills looking for zero-down solar financing')",
  "toneOfVoice": "A tailored, comma-separated set of 3-4 adjective words representing the brand tone (e.g., 'Advisory, authoritative, prompt, and informative')"
}`;

  let generated = {
    niche: niche || "Local Service Provider",
    targetAudience: "Local residential and commercial clients seeking high-quality, dependable services",
    toneOfVoice: "professional, trustworthy, and consultative"
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Business Name: "${name}"\nProvided Niche: "${niche || ''}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              niche: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              toneOfVoice: { type: Type.STRING }
            },
            required: ["niche", "targetAudience", "toneOfVoice"]
          }
        }
      });
      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.niche) generated = parsed;
    } catch (e) {
      console.error("Failed to generate persona via Gemini:", e);
    }
  } else {
    // High-fidelity fallback heuristic based on keywords
    const lowerName = name.toLowerCase();
    if (lowerName.includes("dent") || lowerName.includes("tooth") || lowerName.includes("smile")) {
      generated = {
        niche: "Dental Clinics and Orthodontists",
        targetAudience: "Busy local families and young professionals looking for high-quality cosmetic dentistry, teeth whitening, and flexible evening hours",
        toneOfVoice: "compassionate, authoritative, pristine, and comforting"
      };
    } else if (lowerName.includes("plumb") || lowerName.includes("leak") || lowerName.includes("pipe") || lowerName.includes("drain")) {
      generated = {
        niche: "Residential & Commercial Emergency Plumbing",
        targetAudience: "Homeowners and restaurant managers in the local area needing same-day solutions for burst pipes, drain clogs, and high-efficiency water heaters",
        toneOfVoice: "reliable, straightforward, helpful, and reassuring"
      };
    } else if (lowerName.includes("roof") || lowerName.includes("gutter") || lowerName.includes("exterior")) {
      generated = {
        niche: "Roofing Contractor & Exterior Renovations",
        targetAudience: "Property owners requiring storm damage restoration, asphalt shingle replacements, and honest insurance claims support",
        toneOfVoice: "professional, advisory, sturdy, and honest"
      };
    } else if (lowerName.includes("marketing") || lowerName.includes("agency") || lowerName.includes("consult") || lowerName.includes("digital")) {
      generated = {
        niche: "Digital Marketing & AI-Driven Client Acquisition",
        targetAudience: "B2B local service providers and home contractors looking to automate lead generation, outbound outreach, and maximize appointment bookings",
        toneOfVoice: "innovative, analytical, confident, and results-focused"
      };
    } else if (lowerName.includes("gym") || lowerName.includes("fit") || lowerName.includes("coach") || lowerName.includes("trainer")) {
      generated = {
        niche: "Boutique Fitness Studios & Personal Training",
        targetAudience: "Busy professionals and local residents wishing to reclaim health, build lean muscle, and receive structured nutritional coaching",
        toneOfVoice: "motivational, energetic, knowledgeable, and inclusive"
      };
    }
  }

  res.json(generated);
});

// Verify and set up real Telegram Bot Webhook
app.post("/api/setup-telegram-bot", async (req, res) => {
  const { token, businessInfo } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: "Token is required" });
  }

  try {
    // 1. Verify token with Telegram API
    const verifyRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    if (!verifyRes.ok) {
      return res.json({ 
        success: false, 
        error: "Invalid Bot Token. Please check that you copied it correctly from @BotFather." 
      });
    }

    const botInfo = await verifyRes.json();
    const botUsername = botInfo.result.username;

    // 2. Configure Telegram Webhook to point to our live app URL
    const host = req.get('host') || '';
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : (req.secure ? 'https' : 'http');
    const cleanHost = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http://127.0.0.1:3000" : `https://${host}`;
    
    // Webhook registration URL
    const webhookUrl = `${cleanHost}/api/telegram-webhook/${token}`;
    console.log(`Setting Telegram webhook to URL: ${webhookUrl}`);
    
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const webhookResult = await webhookRes.json();

    if (webhookResult.ok) {
      serverState.telegramBotToken = token;
      serverState.telegramBotUsername = botUsername;
      serverState.telegramWebhookActive = true;
      if (businessInfo) {
        serverState.businessInfo = businessInfo;
      }

      console.log(`Telegram Bot @${botUsername} successfully linked via Webhook!`);

      // Add activity log about the linkage
      serverState.activityLog.unshift({
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: "Telegram Bot Core Connected",
        description: `Successfully established live webhook handshake for @${botUsername} on ${cleanHost}.`,
        status: "success"
      });

      return res.json({ 
        success: true, 
        botUsername,
        message: `Successfully connected @${botUsername}! You can now chat with your bot directly on Telegram.`
      });
    } else {
      return res.json({ 
        success: false, 
        error: `Telegram webhook registration failed: ${webhookResult.description}` 
      });
    }

  } catch (err: any) {
    console.error("Error setting up Telegram bot:", err);
    return res.json({ 
      success: false, 
      error: `Handshake failed: ${err.message || err}` 
    });
  }
});

// Incoming Telegram updates webhook
app.post("/api/telegram-webhook/:token", async (req, res) => {
  const { token } = req.params;
  const update = req.body;

  // Instantly return 200 OK to Telegram to avoid re-deliveries
  res.sendStatus(200);

  if (!update || !update.message || !update.message.text) {
    return;
  }

  const chatId = update.message.chat.id;
  const incomingText = update.message.text;
  const senderName = update.message.from.first_name || "User";

  console.log(`Received Telegram message from chat ID ${chatId}: "${incomingText}"`);

  // Define system instruction for Gemini using the current state values
  const businessName = serverState.businessInfo.name || "My Business";
  const niche = serverState.businessInfo.niche || "local services";
  const targetAudience = serverState.businessInfo.targetAudience || "small businesses";
  const toneOfVoice = serverState.businessInfo.toneOfVoice || "professional, warm, and proactive";

  const systemInstruction = `You are a professional AI business assistant operating autonomously as the "OmniAgentAI" employee for ${senderName}'s business (${businessName}) in the ${niche} space.
Your job is to execute business growth tasks without being asked each time. You proactively find leads, send outreach, post content, and book appointments based on the goals set during setup.
You communicate with the buyer over Telegram in a friendly, conversational, yet business-oriented tone.
The buyer's target audience is: ${targetAudience}.
Your tone of voice is: ${toneOfVoice}.

Based on the buyer's message, reply to them and optionally trigger automated dashboard actions.
You MUST output your response as a JSON object matching this schema:
{
  "responseText": "Your chat response in a messaging format. Keep it concise, friendly, with emoji highlights. Reference your actions if you trigger any (e.g. 'I have added 5 new leads to your dashboard...'). Use markdown for lists.",
  "actions": [
    {
      "type": "add_activity" | "add_lead" | "add_social_post" | "add_approval" | "toggle_mode" | "set_status",
      "payload": {
        // for add_activity: { "title": string, "description": string, "status": "success" | "warning" | "error" | "pending" }
        // for add_lead: { "name": string, "company": string, "niche": string, "email": string, "linkedin": string, "budgetSignal": string, "notes": string }
        // for add_social_post: { "platform": "LinkedIn" | "Twitter" | "Facebook" | "Instagram", "content": string, "scheduledTime": string }
        // for add_approval: { "type": "lead" | "social_post" | "calendar_confirm", "title": string, "description": string, "metadata": object }
        // for toggle_mode: { "modeId": string, "enabled": boolean }
        // for set_status: { "status": "Active" | "Paused" }
      }
    }
  ]
}

Example scenarios:
- If asked to find leads or scrape: add a few leads and an activity item, and confirm in responseText.
- If asked to draft a post: add a social post to the drafts/approvals, and confirm.
- If asked for stats or revenue: mention key revenue milestones ($222 yesterday, best product LocalAI Agency Kit, etc.) and recommend an action.
- If asked to pause or start: trigger toggle_mode or set_status and confirm.`;

  // Rule-based processing fallback if Gemini is missing
  const runFallbackSimulation = () => {
    const text = incomingText.toLowerCase();
    let responseText = `Hello ${senderName}! I'm keeping an eye on your ${niche} business. How can I assist you today?`;
    const actions: any[] = [];

    if (text.includes("lead") || text.includes("find") || text.includes("scrape")) {
      responseText = `Good morning, ${senderName}! 🚀 I've completed a live autonomous scan in the **${niche}** sector.\n\nI qualified **Emma Larson** from *Apex Dental Care* ($High budget signal, Meta Ads active, missing booking portal).\n\nI have logged this in your Lead database and appended a pending review inside your Approvals queue! Reply 'Approve outreach' to proceed.`;
      actions.push(
        {
          type: "add_activity",
          payload: {
            title: "Telegram Autonomous Lead Scan",
            description: `Scraped and qualified Emma Larson (Apex Dental Care) in ${niche}.`,
            status: "success"
          }
        },
        {
          type: "add_lead",
          payload: {
            name: "Emma Larson",
            company: "Apex Dental Care",
            niche: niche,
            email: "emma.l@apexdental.com",
            linkedin: "linkedin.com/in/emma-larson-apex",
            source: "Telegram Auto-Scan",
            budgetSignal: "High",
            notes: "Scraped via live chat command. Active advertiser with missing widget."
          }
        }
      );
    } else if (text.includes("post") || text.includes("tweet") || text.includes("social")) {
      responseText = `📝 I've drafted a premium, context-optimized social draft for your **LinkedIn** profile:\n\n"Many local businesses in ${niche} struggle with client retention..."\n\nI've sent this to your dashboard Approvals queue. Tap 'Approve' on your dashboard to publish!`;
      actions.push(
        {
          type: "add_activity",
          payload: {
            title: "Social Post Drafted via Telegram",
            description: "Generated LinkedIn content draft on client retention.",
            status: "success"
          }
        },
        {
          type: "add_social_post",
          payload: {
            platform: "LinkedIn",
            content: `Many local businesses in ${niche} struggle with client retention. The key is in automated touchpoints: sending warm personalized SMS confirmations and booking slots in 3 seconds. Let our AI handle the boring chores!`,
            scheduledTime: "Today, 5:00 PM"
          }
        }
      );
    } else if (text.includes("revenue") || text.includes("sales") || text.includes("report")) {
      responseText = `📊 *Daily Revenue Briefing for ${businessName}:*\n- Yesterday's Sales: **$222.00** (6 trans)\n- Refunds: **$0.00**\n- Best Seller: **LocalAI Agency Kit**\n\nOperations are running smoothly on auto-pilot!`;
      actions.push({
        type: "add_activity",
        payload: {
          title: "Revenue Report Requested via Telegram",
          description: "Fetched instant sales briefs.",
          status: "success"
        }
      });
    }

    return { responseText, actions };
  };

  let finalResponseText = "";
  let actions: any[] = [];

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: incomingText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    payload: { type: Type.OBJECT }
                  }
                }
              }
            },
            required: ["responseText"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      finalResponseText = parsed.responseText;
      actions = parsed.actions || [];
    } catch (err) {
      console.error("Gemini failed to generate response for Telegram webhook:", err);
      const simulated = runFallbackSimulation();
      finalResponseText = simulated.responseText;
      actions = simulated.actions;
    }
  } else {
    const simulated = runFallbackSimulation();
    finalResponseText = simulated.responseText;
    actions = simulated.actions;
  }

  // Apply actions to server state
  if (actions && Array.isArray(actions)) {
    actions.forEach(act => {
      if (act.type === "add_activity" && act.payload) {
        serverState.activityLog.unshift({
          id: String(Date.now() + Math.random()),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: act.payload.title,
          description: act.payload.description,
          status: act.payload.status || "success"
        });
      } else if (act.type === "add_lead" && act.payload) {
        serverState.leads.unshift({
          id: String(Date.now() + Math.random()),
          name: act.payload.name || "Emma Larson",
          company: act.payload.company || "Apex Dental Care",
          niche: act.payload.niche || businessName,
          email: act.payload.email || "contact@apexdental.com",
          linkedin: act.payload.linkedin || "linkedin.com",
          source: "Telegram Bot Chat",
          budgetSignal: act.payload.budgetSignal || "High",
          notes: act.payload.notes || "Added autonomously via Telegram text.",
          status: "new",
          address: "901 E 5th St, Austin, TX 78702",
          lat: 30.2635,
          lng: -97.7303
        });
      } else if (act.type === "add_social_post" && act.payload) {
        serverState.approvals.unshift({
          id: String(Date.now() + Math.random()),
          type: "social_post",
          title: `Approve ${act.payload.platform || "LinkedIn"} Draft`,
          description: "Auto-generated draft via Telegram commands.",
          metadata: {
            content: act.payload.content
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "pending"
        });
      } else if (act.type === "set_status" && act.payload) {
        serverState.status = act.payload.status;
      }
    });
  }

  // Send reply message back to Telegram
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: finalResponseText,
        parse_mode: "Markdown"
      })
    });
    console.log("Response dispatched back to Telegram successfully.");
  } catch (err) {
    console.error("Failed to send message back to Telegram:", err);
  }
});

// Initialize GoogleGenAI with safe exception handling
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully.");
  } catch (err) {
    console.error("Error initializing GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment. Falling back to local rule-based simulation.");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: ai ? "ai" : "simulation" });
});

// Mock jvzoo webhook endpoint as specified in Section 6.2
app.post("/api/webhooks/jvzoo", (req, res) => {
  const ipnData = req.body;
  console.log("Received JVZoo IPN Webhook:", ipnData);
  
  // Respond with success to acknowledge receipt
  res.json({
    status: "success",
    message: "IPN received and validated",
    buyer: {
      email: ipnData.ctransemail || "buyer@example.com",
      name: ipnData.ctransreceipt || "JVZoo Buyer",
      accountCreated: true
    }
  });
});

// Chat endpoint to communicate with the Agent using Gemini
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory = [], agentConfig = {} } = req.body;
  
  const buyerName = agentConfig.buyerName || "User";
  const businessName = agentConfig.businessName || "My Business";
  const niche = agentConfig.niche || "local service providers";
  const targetAudience = agentConfig.targetAudience || "small business owners";
  const toneOfVoice = agentConfig.toneOfVoice || "professional, warm, and proactive";
  
  const systemInstruction = `You are a professional AI business assistant operating autonomously as the "OmniAgentAI" employee for ${buyerName}'s business (${businessName}) in the ${niche} space.
Your job is to execute business growth tasks without being asked each time. You proactively find leads, send outreach, post content, and book appointments based on the goals set during setup.
You communicate with the buyer over WhatsApp or Telegram in a friendly, conversational, yet business-oriented tone.
The buyer's target audience is: ${targetAudience}.
Your tone of voice is: ${toneOfVoice}.

Based on the buyer's message, reply to them and optionally trigger automated dashboard actions.
You MUST output your response as a JSON object matching this schema:
{
  "responseText": "Your chat response in a messaging format. Keep it concise, friendly, with emoji highlights. Reference your actions if you trigger any (e.g. 'I have added 5 new leads to your dashboard...'). Use markdown for lists.",
  "actions": [
    {
      "type": "add_activity" | "add_lead" | "add_social_post" | "add_approval" | "toggle_mode" | "set_status",
      "payload": {
        // for add_activity: { "title": string, "description": string, "status": "success" | "warning" | "error" | "pending" }
        // for add_lead: { "name": string, "company": string, "niche": string, "email": string, "linkedin": string, "budgetSignal": string, "notes": string }
        // for add_social_post: { "platform": "LinkedIn" | "Twitter" | "Facebook" | "Instagram", "content": string, "scheduledTime": string }
        // for add_approval: { "type": "lead" | "social_post" | "calendar_confirm", "title": string, "description": string, "metadata": object }
        // for toggle_mode: { "modeId": string, "enabled": boolean }
        // for set_status: { "status": "Active" | "Paused" }
      }
    }
  ]
}

Example scenarios:
- If asked to find leads or scrape: add a few leads and an activity item, and confirm in responseText.
- If asked to draft a post: add a social post to the drafts/approvals, and confirm.
- If asked for stats or revenue: mention key revenue milestones ($222 yesterday, best product LocalAI Agency Kit, etc.) and recommend an action.
- If asked to pause or start: trigger toggle_mode or set_status and confirm.`;

  // Rule-based simulation fallback
  const handleSimulation = () => {
    const text = message.toLowerCase();
    let responseText = `Hi ${buyerName}! I am processing your request. Since we are in local simulation mode, I can mock this action for you!`;
    const actions: any[] = [];
    
    if (text.includes("lead") || text.includes("find") || text.includes("scrape")) {
      responseText = `Good morning, ${buyerName}! 🚀 I've completed a scan in the **${niche}** niche. I found **3 qualified leads** matching your target audience of *${targetAudience}*.

I've added these to your **Approvals Queue** and marked them in the Lead database. Would you like me to start the hyper-personalized email outreach?`;
      
      actions.push(
        {
          type: "add_activity",
          payload: {
            title: "Autonomous Lead Generation Scan",
            description: `Scraped and qualified 3 new leads in the ${niche} sector.`,
            status: "success"
          }
        },
        {
          type: "add_lead",
          payload: {
            name: "Emma Larson",
            company: "Apex Dental Care",
            niche: niche,
            email: "emma.l@apexdental.com",
            linkedin: "linkedin.com/in/emma-larson-apex",
            budgetSignal: "High (Running Google Ads)",
            notes: "Outdated website with no chatbot. Prefers email outreach."
          }
        },
        {
          type: "add_lead",
          payload: {
            name: "Dr. Marcus Vance",
            company: "Vance Orthodontics",
            niche: niche,
            email: "contact@vanceortho.com",
            linkedin: "linkedin.com/in/marcus-vance-ortho",
            budgetSignal: "Medium (Active Instagram)",
            notes: "Strong social media presence but calendar integration is missing."
          }
        }
      );
    } else if (text.includes("post") || text.includes("tweet") || text.includes("social")) {
      responseText = `I've drafted a premium, niche-relevant post for your business. I selected **LinkedIn** to reach your target audience of *${targetAudience}*.

I have queued this in your **Approvals Queue** for your review before publishing. Please check your dashboard or reply 'Approve' to go live!`;
      
      actions.push(
        {
          type: "add_activity",
          payload: {
            title: "Social Media Post Drafted",
            description: "Generated optimized content draft for LinkedIn.",
            status: "success"
          }
        },
        {
          type: "add_social_post",
          payload: {
            platform: "LinkedIn",
            content: `Many ${targetAudience} struggle with execution in 2026. The answer isn't another software subscription; it's autonomous delegation. By letting AI handle lead finding and routine reporting, business owners can focus purely on closing. Agree? Let's discuss in the comments! #AI #BusinessAutomation #Productivity`,
            scheduledTime: "Today, 5:00 PM"
          }
        }
      );
    } else if (text.includes("revenue") || text.includes("sales") || text.includes("money") || text.includes("report")) {
      responseText = `📊 *Daily Revenue & Affiliate Briefing:*
Yesterday's Sales: **$222.00** across 6 JVZoo transactions
Refunds: **$0.00**
New Affiliates: **1 signup**

*Product Performance:*
- Top product: **LocalAI Agency Kit** (4 sales)
- Worst performer: **ClickMagick promo** (0 conversions from 89 clicks)

*Recommended Action:* Promote **Product Y** — it had a 12% conversion rate yesterday. Would you like me to draft a re-engagement email sequence?`;
      
      actions.push({
        type: "add_activity",
        payload: {
          title: "Revenue Report Dispatched",
          description: "Compiled sales from JVZoo, Stripe, and PayPal.",
          status: "success"
        }
      });
    } else if (text.includes("pause") || text.includes("stop")) {
      responseText = `Understood. I have paused my autonomous background operations. Let me know when you are ready to resume! ⏸️`;
      actions.push({
        type: "set_status",
        payload: { status: "Paused" }
      });
    } else if (text.includes("start") || text.includes("resume") || text.includes("launch")) {
      responseText = `Autonomous employee is active and online! I will perform my tasks every ${agentConfig.heartbeat || "4 hours"}. Let's secure some clients! 🚀`;
      actions.push({
        type: "set_status",
        payload: { status: "Active" }
      });
    } else {
      responseText = `Hello! I received your message: "${message}". I am fully initialized and keeping an eye on your **${niche}** business.

You can ask me to:
- 🔍 *'Find dental leads'* (or any niche)
- 📝 *'Draft a social post'*
- 📊 *'Give me the revenue report'*
- ⏸️ *'Pause operations'* or ▶️ *'Resume operations'*

What can I handle for you right now?`;
    }
    
    return { responseText, actions };
  };

  if (!ai) {
    return res.json(handleSimulation());
  }

  try {
    const formattedHistory = chatHistory.slice(-10).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Generate content using the official SDK rules
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: {
              type: Type.STRING,
              description: "The chat response in conversational messaging format. Keep it personal and highly context-aware.",
            },
            actions: {
              type: Type.ARRAY,
              description: "Optional autonomous dashboard events to fire based on user query",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Event type to update the dashboard",
                  },
                  payload: {
                    type: Type.OBJECT,
                    description: "Free-form payload with variables corresponding to the action type"
                  }
                }
              }
            }
          },
          required: ["responseText"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);

  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Graceful fallback to simulated rule-based flow
    res.json(handleSimulation());
  }
});

// Real AI-Powered Gap Analyzer Audit using Gemini API
app.post("/api/generate-audit", async (req, res) => {
  const { companyName, website, industry } = req.body;
  
  const preset = [
    { id: "spa", label: "Spa, Well-being & Wellness Center", defaultName: "Zen Float Oasis" },
    { id: "dental", label: "Dentist & Dental Practice", defaultName: "Starlight Dentistry" },
    { id: "gym", label: "Gym, CrossFit or Yoga Studio", defaultName: "Iron Pulse Gym" },
    { id: "service", label: "HVAC, Plumbing or Local Contractor", defaultName: "Rapid Rescue Plumbing" },
    { id: "agency", label: "Design, Marketing or Tech Agency", defaultName: "Vortex Creative Agency" }
  ].find(p => p.id === industry);

  const resolvedName = (companyName && companyName.trim()) || preset?.defaultName || "Your Business";
  const resolvedNiche = preset?.label || "Local Service Provider";
  const resolvedWebsite = (website && website.trim()) || "www.your-site-url.com";

  // Highly realistic fallback template
  const fallbackReport = {
    score: 42,
    grade: "D-",
    niche: resolvedNiche,
    companyName: resolvedName,
    website: resolvedWebsite,
    gaps: [
      {
        id: "gap1",
        title: "Frictionless Booking Channel",
        status: "critical",
        description: `No real-time mobile scheduling widget detected on landing page of ${resolvedWebsite}. Users must fill out a manual, multi-page contact form.`,
        impact: "Losing up to 35% of late-night mobile traffic queries."
      },
      {
        id: "gap2",
        title: "Automated SMS/Email Reply Speed",
        status: "critical",
        description: "Our simulated request timed out after 30 minutes without an automated handshake or confirmation reply.",
        impact: "Competitors with instant appointment setters secure the clients first."
      },
      {
        id: "gap3",
        title: "Follow-up Strategy Verification",
        status: "warning",
        description: "Domain fails to register standard remarketing metrics or secondary triggers for booking abandonments.",
        impact: "Wastes high-intent click costs."
      }
    ],
    proposalSubject: `Quick suggest to simplified online scheduling for ${resolvedName}`,
    proposalBody: `Hi,

I visited ${resolvedName} (${resolvedWebsite}) earlier today and noticed your clients can't easily reserve specific openings from their phones without submitting a manual form and waiting for a callback.

Most ${resolvedNiche.toLowerCase()} practitioners lose about 35% of prospective client interest because bookings happen after hours when owners are busy.

We built a 1-click scheduler module for ${resolvedName} that lets prospects hold slots in 5 seconds. Would you be open to seeing a 2-minute screenshot tour of how we might boost your appointment volume by 25%?

Best,
Auto-Agent / Client Acquisition`
  };

  if (!ai) {
    console.log("No GEMINI_API_KEY. Returning fallback audit report.");
    return res.json({ status: "success", report: fallbackReport, mode: "template" });
  }

  try {
    const prompt = `Act as an expert digital client-getting consultant and lead finder agent.
    Generate a highly realistic, customized and actionable Conversion and Booking Gap Audit Report for the following business:
    Business Name: "${resolvedName}"
    Website URL: "${resolvedWebsite}"
    Industry Group: "${resolvedNiche}"

    Analyze the likely gaps and conversion friction this specific business might have on their website, especially regarding real-time booking, automated SMS follow-up speeds, and conversion rates. Provide customized, highly professional feedback. Do NOT use generic text.
    Also draft a highly personalized outbound pitch/proposal email targeted at the owner to solve these gaps.
    
    Ensure the score is a low number between 30 and 55 (representing typical low-conversion websites), and the grade is between D- and C.
    
    You MUST return a JSON object conforming exactly to this schema:
    {
      "score": number, // e.g. 38
      "grade": "string", // e.g. "D" or "D-" or "D+" or "C-"
      "niche": "string", // the niche name
      "companyName": "string", // the business name
      "website": "string", // the website URL
      "gaps": [
        {
          "id": "string", // unique identifier, e.g. "gap1", "gap2", "gap3"
          "title": "string", // e.g., "Frictionless booking channel", "Google Maps/Local Authority", etc.
          "status": "critical" | "warning" | "optimal",
          "description": "string", // tailored explanation of the specific gap
          "impact": "string" // specific impact on their revenue or client retention
        }
      ],
      "proposalSubject": "string", // engaging, personalized subject line
      "proposalBody": "string" // complete personalized outbound pitch email body. Feel free to use newlines (\n) for paragraph spacing.
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            grade: { type: Type.STRING },
            niche: { type: Type.STRING },
            companyName: { type: Type.STRING },
            website: { type: Type.STRING },
            gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["id", "title", "status", "description", "impact"]
              }
            },
            proposalSubject: { type: Type.STRING },
            proposalBody: { type: Type.STRING }
          },
          required: ["score", "grade", "niche", "companyName", "website", "gaps", "proposalSubject", "proposalBody"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ status: "success", report: parsed, mode: "ai" });
  } catch (error) {
    console.error("Gemini failed to generate custom audit report:", error);
    return res.json({ status: "success", report: fallbackReport, mode: "template" });
  }
});

// Real Live Lead Finder using Gemini API
app.post("/api/generate-lead", async (req, res) => {
  const { location = "Austin", niche = "Dental clinics", businessInfo = {} } = req.body;
  const agentName = businessInfo.name || "OmniAgentAI";

  const fallbackLeads = [
    {
      name: "Marcus Aurelius",
      company: `${location} Elite Wellness`,
      email: "marcus@elitewellness.com",
      linkedin: `linkedin.com/in/marcus-wellness-${location.toLowerCase()}`,
      budgetSignal: "High (Running Facebook Campaigns)",
      notes: `Active advertiser but missing any automated calendar hooks. Our agent can install a direct booking flow on their landing page.`
    },
    {
      name: "Dr. Clara Barton",
      company: `${location} Family Chiropractic`,
      email: "contact@familychiro.com",
      linkedin: `linkedin.com/in/clara-barton-chiro`,
      budgetSignal: "Medium (Active Instagram Page)",
      notes: `Great organic reach on social media but completely lacks a web chat or automated scheduling tool to convert off-hours queries.`
    },
    {
      name: "David Davidson",
      company: `${location} Precision Plumbing`,
      email: "david@precisionplumb.com",
      linkedin: `linkedin.com/in/david-precision`,
      budgetSignal: "High (Running Local Services Ads)",
      notes: `Relies entirely on direct telephone calls during normal office hours. Missing out on night and weekend emergencies.`
    }
  ];

  const fallback = fallbackLeads[Math.floor(Math.random() * fallbackLeads.length)];

  if (!ai) {
    console.log("No GEMINI_API_KEY. Returning highly realistic mock local lead.");
    return res.json({ status: "success", lead: fallback, mode: "template" });
  }

  try {
    const prompt = `Act as an expert local lead generation scout. 
    Our client business is "${businessInfo.name || "My Agency"}" offering business growth, chat automation, and social media services.
    Generate EXACTLY ONE highly qualified, extremely realistic prospective business lead located in "${location}" matching the niche category "${niche}".
    Ensure the lead has realistic local details, a real-sounding name of the owner/manager, valid-looking business email, custom LinkedIn profile slug, strong budget signals, and detailed, highly tailored notes outlining their specific website, chatbot, scheduling, or marketing weaknesses that our client can solve.

    Return a JSON object conforming exactly to this schema:
    {
      "name": "Full name of the contact person (owner or head decision maker)",
      "company": "Name of the local business",
      "email": "contact@businessdomain.com",
      "linkedin": "linkedin.com/in/contact-name",
      "budgetSignal": "High (Running Active Ads) or Medium (Active social post frequency)",
      "notes": "A detailed, custom analysis of why this lead is qualified, their exact technical or marketing flaws, and what solution our agent should propose."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            company: { type: Type.STRING },
            email: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            budgetSignal: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["name", "company", "email", "linkedin", "budgetSignal", "notes"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ status: "success", lead: parsed, mode: "ai" });
  } catch (error) {
    console.error("Gemini failed to generate custom lead:", error);
    return res.json({ status: "success", lead: fallback, mode: "template" });
  }
});

// Live AI Outreach Writer using Gemini API
app.post("/api/generate-outreach", async (req, res) => {
  const { lead = {}, tone = "warm", businessInfo = {} } = req.body;
  const ourBrandName = businessInfo.name || "OmniAgentAI";
  const ourNiche = businessInfo.niche || "autonomous agent growth services";

  const fallbackOutreach = `Hi ${lead.name || "there"},\n\nI was reviewing ${lead.company || "your business"} and noticed you are active on digital platforms. However, it seems there's a huge opportunity to capture more customers by automating your scheduling and live responses.\n\nAt ${ourBrandName}, we build friendly digital employees that handle this for you. Would you be open to a quick 5-minute call to see how we could pack your calendar?\n\nBest regards,\nAutomated Partner at ${ourBrandName}`;

  if (!ai) {
    console.log("No GEMINI_API_KEY. Returning formatted template outreach.");
    return res.json({ status: "success", content: fallbackOutreach, mode: "template" });
  }

  try {
    const prompt = `You are a world-class copywriter and cold outreach expert representing "${ourBrandName}", which specializes in "${ourNiche}".
    Draft a highly personalized, compelling cold outreach message (suitable for Email or LinkedIn/WhatsApp direct message) to this business prospect:
    Prospect Name: ${lead.name}
    Prospect Company: ${lead.company}
    Prospect Weaknesses/Signal: ${lead.notes}
    
    The outreach message tone of voice must be strictly: "${tone}".
    Guidelines for the tone:
    - If "warm": Friendly, helpful, relational, consultative, showing genuine interest in helping them grow.
    - If "professional": Polished, data-driven, highlighting efficiencies, ROI, and clear business metrics.
    - If "direct": Short, crisp, straight-to-the-point, respecting their busy schedule, fast call-to-action.
    - If "bold": Eye-catching, highly confident, offering a guaranteed value, high energy.
    
    Ensure the outreach feels highly customized, mentions their business by name, refers specifically to their identified weaknesses/opportunities in a polite way, and proposes a direct, friction-free call to action (like a quick 5-min demo or a calendar link). Do NOT use generic placeholder template text.
    
    Return a JSON object conforming exactly to this schema:
    {
      "content": "The complete outreach message body text. Use double newlines for paragraph breaks."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING }
          },
          required: ["content"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ status: "success", content: parsed.content, mode: "ai" });
  } catch (error) {
    console.error("Gemini failed to generate outreach copy:", error);
    return res.json({ status: "success", content: fallbackOutreach, mode: "template" });
  }
});

// Heartbeat processing to run a live scan and return customized results
app.post("/api/heartbeat", async (req, res) => {
  const { businessInfo = {}, activeModes = [], status = "Active", openClawApiKey = "", openClawEndpoint = "" } = req.body;

  if (status === "Paused") {
    return res.json({
      status: "paused",
      message: "Agent is paused. Resume autonomous operations to start scans."
    });
  }

  const niche = businessInfo.niche || "local service providers";
  const name = businessInfo.name || "My Business";
  const targetAudience = businessInfo.targetAudience || "local customers";
  const toneOfVoice = businessInfo.toneOfVoice || "professional, warm, and proactive";

  // Check if OpenClaw API integration was provided and attempt to perform a real API call to openclaw.ai
  if (openClawApiKey && openClawEndpoint) {
    try {
      const cleanEndpoint = openClawEndpoint.endsWith("/") ? openClawEndpoint.slice(0, -1) : openClawEndpoint;
      const targetUrl = cleanEndpoint.includes("/heartbeat") ? cleanEndpoint : `${cleanEndpoint}/heartbeat`;
      
      console.log(`Making real API request to OpenClaw.ai: ${targetUrl}`);
      
      const openClawRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openClawApiKey}`,
          "X-OpenClaw-Key": openClawApiKey
        },
        body: JSON.stringify({
          businessInfo,
          activeModes,
          timestamp: new Date().toISOString()
        })
      });

      if (openClawRes.ok) {
        const json = await openClawRes.json();
        // Return real OpenClaw response data
        if (json && (json.data || json.lead)) {
          return res.json({
            status: "success",
            data: json.data || json,
            mode: "openclaw"
          });
        }
      } else {
        console.warn(`Real OpenClaw.ai connection returned error status: ${openClawRes.status}`);
      }
    } catch (err) {
      console.error("Failed to connect to real OpenClaw.ai endpoint:", err);
    }
  }

  // If Gemini API is available, generate a real customized lead and a real tailored social post draft using Gemini!
  if (ai) {
    try {
      const prompt = `Act as an autonomous business development agent operating as "OmniAgentAI" for "${name}" (Niche: "${niche}", Target Audience: "${targetAudience}").
      We are running a scheduled synchronization heartbeat. Generate EXACTLY ONE highly qualified realistic prospective business lead that matches our niche, and EXACTLY ONE highly engaging social media post draft tailored to our brand tone: "${toneOfVoice}".
      
      Return a JSON object with this EXACT schema:
      {
        "lead": {
          "name": "Full name of the business contact person",
          "company": "Realistic local company name in our niche",
          "email": "contact@company.com",
          "linkedin": "linkedin.com/in/contact-name-slug",
          "budgetSignal": "e.g. High (Running Meta Ads) or Medium (Active posting)",
          "notes": "A precise, realistic explanation of why this business was qualified, what is missing on their website/social, and how our agent will outreach to them."
        },
        "socialPost": {
          "platform": "LinkedIn" | "Twitter" | "Instagram",
          "content": "A beautifully drafted, high-converting social media post (with hashtags) tailored to our brand and target audience."
        }
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lead: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  company: { type: Type.STRING },
                  email: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  budgetSignal: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name", "company", "email", "linkedin", "budgetSignal", "notes"]
              },
              socialPost: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["platform", "content"]
              }
            },
            required: ["lead", "socialPost"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        status: "success",
        data: parsed,
        mode: "ai"
      });
    } catch (err) {
      console.error("Failed to generate heartbeat data with Gemini:", err);
    }
  }

  // Fallback programmatic generation using high-quality templates if Gemini key is missing
  const dentalLeads = [
    { name: "Dr. Alicia Vance", company: "Austin Pediatric Dentistry", email: "info@austinpediatricdentistry.com", linkedin: "linkedin.com/in/alicia-vance-dds", budgetSignal: "High (Running Google Ads)", notes: "Runs monthly Google ads but website is completely non-responsive on mobile with a broken Calendly booking link." },
    { name: "Dr. Raymond Holt", company: "Brodie Lane Orthodontics", email: "drholt@brodielaneortho.com", linkedin: "linkedin.com/in/raymond-holt-ortho", budgetSignal: "Medium (Active Facebook)", notes: "Missing live chat or assistant on Facebook Page. Potential to install automated booking widget." },
    { name: "Dr. Sarah Kim", company: "Zilker Park Dental Care", email: "sarah@zilkerparkdental.com", linkedin: "linkedin.com/in/sarah-kim-zilker", budgetSignal: "High (No online booking)", notes: "Highly rated on Yelp but has no automated calendar interface, losing off-hours weekend bookings." }
  ];

  const generalLeads = [
    { name: "Robert Miller", company: "Miller & Sons Local Services", email: "robert@millerandsons.com", linkedin: "linkedin.com/in/robert-miller-contracting", budgetSignal: "High (Meta Ads Live)", notes: "Actively running Facebook leads ads but relies entirely on manual phone callbacks for booking." },
    { name: "Elena Rostova", company: "Elite Wellness & Aesthetics", email: "elena@elitewellness.com", linkedin: "linkedin.com/in/elena-rostova-spa", budgetSignal: "Medium (Instagram Active)", notes: "Receives multiple inquiries on Instagram comments with no automated lead capturing bridge or booking widget." }
  ];

  const isDental = niche.toLowerCase().includes("dent") || name.toLowerCase().includes("dent");
  const selectedList = isDental ? dentalLeads : generalLeads;
  const leadSample = selectedList[Math.floor(Math.random() * selectedList.length)];

  const postSample = {
    platform: "LinkedIn",
    content: `Many local businesses in the ${niche} space struggle with client retention. The key is in automated touchpoints: sending warm personalized SMS confirmations, booking slots in 3 seconds, and following up on auto-pilot. \n\nLet our AI employees do the heavy lifting while you focus on pristine service delivery! 🚀\n\n#${name.replace(/\s+/g, "")} #BusinessGrowth #Automation2026`
  };

  return res.json({
    status: "success",
    data: {
      lead: leadSample,
      socialPost: postSample
    },
    mode: "template"
  });
});

// Vite Dev Server Integration & Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
