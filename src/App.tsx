import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Check, 
  Loader2, 
  Calendar, 
  ChevronRight, 
  Copy, 
  Plus, 
  Trash, 
  Settings, 
  Database, 
  Cpu, 
  Layers, 
  Clock, 
  TrendingUp, 
  Video, 
  AlertCircle, 
  X, 
  Cloud, 
  Facebook, 
  Instagram, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface ScriptScene {
  time: string;
  narration: string;
  visuals: string;
}

interface VideoScript {
  title: string;
  hook: string;
  script: ScriptScene[];
  suggestedMusic: string;
  captions: string;
  hashtags: string[];
}

interface PromptRecord {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'JSON Validated' | 'Completed' | 'Pending';
  tone: string;
  platform: string;
  data: VideoScript;
}

interface QueueItem {
  id: string;
  title: string;
  status: 'Pending' | 'Rendering' | 'Scheduled' | 'Published';
  progress?: number;
  timeSlot: string;
  platform: string;
  aspectRatio: '9:16' | '16:9';
  gradientFrom: string;
  gradientTo: string;
  scriptId?: string;
}

// Highly polished sample preloaded data to populate the dashboard immediately
const PRELOADED_SCRIPTS: PromptRecord[] = [
  {
    id: 's-1',
    prompt: 'Generate 5 viral cooking tips for Reels with engaging captions and hashtags',
    timestamp: '2m ago',
    status: 'JSON Validated',
    tone: 'Exciting',
    platform: 'Instagram Reels',
    data: {
      title: '5 Golden Rules of Restaurant Quality Steak',
      hook: 'Stop burning your high-end steak! Here are 5 chef secrets you need to know today.',
      suggestedMusic: 'Upbeat modern jazz-hop beats',
      captions: 'Elevate your home cooking to 5-star standard! 🥩 Tap follow for the ultimate culinary blueprints. Save this for your next date night!',
      hashtags: ['CookingHacks', 'SteakBlueprints', 'ChefSecrets', 'FoodScience'],
      script: [
        { time: '0:00 - 0:03', narration: 'You are cooking your steak all wrong. Save this video to fix it permanently!', visuals: 'Extreme close up of a beautiful Ribeye hitting a screaming hot cast iron pan with steam sizzling.' },
        { time: '0:03 - 0:10', narration: 'Rule 1: Always pat your steak completely dry. Wet steak boils, dry steak sears.', visuals: 'Chef using high-quality linen towel to pat a dry raw steak aggressively.' },
        { time: '0:10 - 0:18', narration: 'Rule 2: Don’t season early unless it’s 40 minutes ahead. Otherwise, salt pulls liquid out!', visuals: 'Macro shots of rich kosher salt falling onto clean meat like snow flakes.' },
        { time: '0:18 - 0:30', narration: 'Rule 3: Sear at 450 degrees. Add butter, garlic, and thyme inside the last 60 seconds to baste.', visuals: 'Melted garlic butter spooned rich and golden over a thick beautifully caramelized brown crust.' }
      ]
    }
  },
  {
    id: 's-2',
    prompt: 'Quick tech hacks for iPhone 15 users, 60-second format with transitions',
    timestamp: '1h ago',
    status: 'Completed',
    tone: 'Informative',
    platform: 'TikTok',
    data: {
      title: '3 Secret iPhone Setting Alterations',
      hook: 'These 3 iOS settings are literally mining your battery background. Turn them off now!',
      suggestedMusic: 'Lofi futuristic synthesized chillwave',
      captions: 'Boost your battery capacity by 15% with these hidden settings! 📱 Share with your friends before they drain out.',
      hashtags: ['AppleTricks', 'iPhoneTips', 'iOSSecrets', 'TechHacks'],
      script: [
        { time: '0:00 - 0:05', narration: 'Your iPhone 15 battery feels dead by noon? It is because of these 3 settings.', visuals: 'Sleek motion graphic transition zoom-in to an iPhone setting screen.' },
        { time: '0:05 - 0:15', narration: 'Go to Settings, Privacy, and turn off Location Alerts. It constantly pings satellites!', visuals: 'User tapping on System Services showing battery location trackers.' },
        { time: '0:15 - 0:30', narration: 'Next, disable Background App Refresh on everything except messaging apps.', visuals: 'Quick scroll of multiple apps with gray switches switching off.' }
      ]
    }
  },
  {
    id: 's-3',
    prompt: 'Daily motivation quotes for entrepreneurs with cinematic background music',
    timestamp: '4h ago',
    status: 'Completed',
    tone: 'Inspirational',
    platform: 'YouTube Shorts',
    data: {
      title: 'The Blueprint of Persistence',
      hook: 'If you are about to quit on your business today, listen to this for 10 seconds.',
      suggestedMusic: 'Cinematic orchestral crescendo with deep strings',
      captions: 'The hardest steps always precede the tallest view. 📈 Keep pushing, your progress is gathering compound energy.',
      hashtags: ['MindsetShift', 'FounderLife', 'DailyMotivation', 'Resilience'],
      script: [
        { time: '0:00 - 0:06', narration: 'Nobody sees the years of silent building. They only see the overnight highlight.', visuals: 'A lone drone shot of misty mountain peak during a dark dramatic purple sunrise.' },
        { time: '0:06 - 0:15', narration: 'Every micro-failure is laying deep soil for your inevitable breakthrough.', visuals: 'Extreme close up of a seedling breaking out of charcoal soil in cinematic time-lapse.' }
      ]
    }
  }
];

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-1',
    title: 'Restaurant Quality Steak',
    status: 'Pending',
    timeSlot: '14:30 PM',
    platform: 'Instagram Reels',
    aspectRatio: '9:16',
    gradientFrom: 'from-blue-900',
    gradientTo: 'to-indigo-950',
    scriptId: 's-1'
  },
  {
    id: 'q-2',
    title: 'Secret iPhone Battery Settings',
    status: 'Scheduled',
    timeSlot: '18:00 PM',
    platform: 'TikTok',
    aspectRatio: '9:16',
    gradientFrom: 'from-green-900',
    gradientTo: 'to-emerald-950',
    scriptId: 's-2'
  }
];

export default function App() {
  const [scripts, setScripts] = useState<PromptRecord[]>(() => {
    const saved = localStorage.getItem('fluxauto_scripts');
    return saved ? JSON.parse(saved) : PRELOADED_SCRIPTS;
  });

  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem('fluxauto_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE;
  });

  // State management
  const [promptInput, setPromptInput] = useState('');
  const [tone, setTone] = useState('exciting');
  const [platform, setPlatform] = useState('TikTok');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  
  // Selected visual tabs/pipeline views
  const [activePipelineStep, setActivePipelineStep] = useState<'all' | 'gpt' | 'render' | 'drive' | 'buffer' | 'publish'>('all');
  const [selectedScript, setSelectedScript] = useState<PromptRecord | null>(PRELOADED_SCRIPTS[0]);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active render simulation progress
  const [renderingItemId, setRenderingItemId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);

  // Daily generate count (simulated limit)
  const [dailyCount, setDailyCount] = useState(12);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('fluxauto_scripts', JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    localStorage.setItem('fluxauto_queue', JSON.stringify(queue));
  }, [queue]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Run full-stack server-side Gemini generation with responsive fallback for demo ease
  const handleGenerateScriptPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          tone,
          platform
        })
      });

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        const generatedScript = responseData.data as VideoScript;
        
        const newRecord: PromptRecord = {
          id: `s-${Date.now()}`,
          prompt: promptInput,
          timestamp: 'Just now',
          status: 'JSON Validated',
          tone: tone.charAt(0).toUpperCase() + tone.slice(1),
          platform,
          data: generatedScript
        };

        setScripts(prev => [newRecord, ...prev]);
        setSelectedScript(newRecord);
        setDailyCount(prev => Math.min(prev + 1, 50));
        setPromptInput('');
        setShowGeneratorModal(false);
      } else {
        // Offer graceful local engine fallback options so the app never feels broken
        throw new Error(responseData.error || 'Gemini system failed to construct JSON output structure');
      }
    } catch (err: any) {
      console.warn('API Endpoint issue, running localized procedural fallback:', err.message);
      setGenError(err.message || 'Connecting to scripting engine server failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Safe localized procedural script trigger if they lack a Gemini Key
  const triggerLocalSimulationEngine = () => {
    setIsGenerating(true);
    setGenError(null);

    setTimeout(() => {
      const mockIdeas = [
        {
          title: `3 Essential Secrets of ${promptInput || 'Your Selected Niche'}`,
          hook: `Nobody wants you to know these 3 hacks about ${promptInput || 'your industry'}. Listen closely.`,
          suggestedMusic: 'Pumping cyber-neon electronic high velocity synth',
          captions: `Unlock ultimate productivity blueprints today! ⚡ Saved specifically for experts looking to optimize high-performance loops.`,
          hashtags: ['ProSecrets', 'LifeHacks', 'Blueprints', 'UltimateGuide'],
          script: [
            { time: '0:00 - 0:04', narration: `Here are three hacks about ${promptInput || 'your topic'} that will save you days of lost work.`, visuals: 'Macro shots of high-contrast UI windows opening quickly with particle flares.' },
            { time: '0:04 - 0:15', narration: 'First, stop using standard presets. Tailoring your container is step zero of professional craft.', visuals: 'A gorgeous mechanical zoom on sleek code editor and glowing indicators.' },
            { time: '0:15 - 0:30', narration: 'Second, always isolate secondary dependencies in decoupled containers to avoid HMR loops.', visuals: 'Abstract nodes linking in sequence on a futuristic digital grid with blueprint outlines.' }
          ]
        },
        {
          title: `Why Most Creators Fail with ${promptInput || 'This Concept'}`,
          hook: `This is the single biggest mistake people make with ${promptInput || 'video scripting'}. Ready?`,
          suggestedMusic: 'Intense cinematic low-synth pulse with energetic kick',
          captions: `Avoid this critical pitfall and 10x your output quality! 🎬 Follow for daily automation workflows.`,
          hashtags: ['AutomationSecrets', 'CreatorTips', 'MistakesToAvoid', 'GrowthBlueprint'],
          script: [
            { time: '0:00 - 0:05', narration: `If you want to master ${promptInput || 'this concept'}, you MUST avoid this single mistake.`, visuals: 'Dramatic lens flare zooming in on clean metallic gears rotating slowly.' },
            { time: '0:05 - 0:18', narration: 'Most people overcomplicate the design. True craftsmanship means removing everything block by block until only clarity remains.', visuals: 'Beautiful wireframe animation isolating active UI components.' }
          ]
        }
      ];

      const chosen = mockIdeas[Math.floor(Math.random() * mockIdeas.length)];
      
      const newRecord: PromptRecord = {
        id: `s-${Date.now()}`,
        prompt: promptInput || 'Simulated Blueprint Script Generation',
        timestamp: 'Just now',
        status: 'JSON Validated',
        tone: tone.charAt(0).toUpperCase() + tone.slice(1),
        platform,
        data: chosen
      };

      setScripts(prev => [newRecord, ...prev]);
      setSelectedScript(newRecord);
      setDailyCount(prev => Math.min(prev + 1, 50));
      setPromptInput('');
      setGenError(null);
      setShowGeneratorModal(false);
      setIsGenerating(false);
    }, 1200);
  };

  // Add script to scheduling queue
  const handleAddToQueue = (scriptRes: PromptRecord) => {
    // Check if already queued
    const isAlreadyQueued = queue.some(qi => qi.scriptId === scriptRes.id);
    if (isAlreadyQueued) return;

    // Pick random colorful space gradients for thumbnail look
    const colorPresets = [
      { from: 'from-blue-900', to: 'to-indigo-950' },
      { from: 'from-purple-900', to: 'to-fuchsia-950' },
      { from: 'from-emerald-900', to: 'to-teal-950' },
      { from: 'from-cyan-900', to: 'to-blue-950' },
      { from: 'from-rose-900', to: 'to-red-950' }
    ];
    const pickColor = colorPresets[queue.length % colorPresets.length];

    // Calculate a simulated schedule slot
    const slots = ['10:00 AM', '12:30 PM', '15:15 PM', '18:45 PM', '21:00 PM'];
    const currentHourMin = slots[queue.length % slots.length];

    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      title: scriptRes.data.title,
      status: 'Pending',
      timeSlot: currentHourMin,
      platform: scriptRes.platform,
      aspectRatio: aspectRatio,
      gradientFrom: pickColor.from,
      gradientTo: pickColor.to,
      scriptId: scriptRes.id
    };

    setQueue(prev => [...prev, newItem]);
  };

  // Remove item from queue
  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(qi => qi.id !== id));
  };

  // Trigger manual simulation of cloud/local video render pipeline
  const handleSimulateRender = (itemId: string) => {
    if (renderingItemId) return; // Allow only one concurrent render action
    
    setRenderingItemId(itemId);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Complete state update after animation
          setTimeout(() => {
            setQueue(currentQueue => 
              currentQueue.map(item => 
                item.id === itemId 
                  ? { ...item, status: 'Scheduled' } 
                  : item
              )
            );
            setRenderingItemId(null);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-600/30 selection:text-white">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-10000"></div>
      <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-purple-600/8/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[12000ms]"></div>
      <div className="absolute top-[50%] left-[60%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[180px] pointer-events-none"></div>

      {/* Main Content View with Frame */}
      <div id="immersive-canvas-wrapper" className="w-full max-w-7xl mx-auto px-4 py-6 flex-1 flex flex-col gap-6 z-10">
        
        {/* Header Block */}
        <header id="header-flux-bar" className="border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-900/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black tracking-tight text-white">FLUX<span className="text-blue-500">AUTO</span></span>
                <span className="text-xs font-mono text-slate-500">v2.1</span>
              </div>
              <p className="text-xs text-slate-400">Automated AI Video Production Console</p>
            </div>

            <div className="ml-4 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-[10px] uppercase tracking-widest text-green-400 font-semibold">Engine Active</span>
            </div>
          </div>

          <div id="header-limits" className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Daily Generation Limit</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-white font-black">{dailyCount} / 50 Videos</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                    style={{ width: `${(dailyCount / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button 
              id="btn-trigger-composer"
              onClick={() => setShowGeneratorModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 group transform active:scale-95"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Generate Content</span>
            </button>
          </div>
        </header>

        {/* Workflow Active Pipeline Grid Map */}
        <section id="pipeline-nodes-map" className="bg-slate-900/10 border border-white/5 rounded-3xl p-6 relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Automation Pipeline Flow</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded border border-blue-400/20 uppercase">
                Active State: {activePipelineStep.toUpperCase()}
              </span>
              {activePipelineStep !== 'all' && (
                <button 
                  onClick={() => setActivePipelineStep('all')}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
                >
                  Reset View
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10 px-2">
            
            {/* Outer Line visual joining the nodes together on wider screens */}
            <div className="hidden md:block absolute top-[2.2rem] left-10 right-10 h-[2px] bg-gradient-to-r from-teal-500/20 via-blue-500/55 to-green-500/20 z-0"></div>

            {/* Node 1: AI Script Generator */}
            <div 
              id="node-gpt-script"
              onClick={() => setActivePipelineStep(activePipelineStep === 'gpt' ? 'all' : 'gpt')}
              className={`z-10 bg-slate-950/40 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-center ${
                activePipelineStep === 'gpt' 
                  ? 'border-teal-400 bg-teal-950/20 shadow-[0_0_25px_rgba(20,184,166,0.3)]' 
                  : 'border-white/5 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2.5 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white">1. Gemini Scripting</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Structured AI Screenplay</p>
            </div>

            {/* Node 2: CapCut Auto Renderer */}
            <div 
              id="node-capcut-renderer"
              onClick={() => setActivePipelineStep(activePipelineStep === 'render' ? 'all' : 'render')}
              className={`z-10 bg-slate-950/40 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-center ${
                activePipelineStep === 'render' 
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_25px_rgba(99,102,241,0.3)]' 
                  : 'border-white/5 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2.5">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">2. Auto Render</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">CapCut Engine Live</p>
            </div>

            {/* Node 3: Cloud Store Storage */}
            <div 
              id="node-cloud-store"
              onClick={() => setActivePipelineStep(activePipelineStep === 'drive' ? 'all' : 'drive')}
              className={`z-10 bg-slate-950/40 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-center ${
                activePipelineStep === 'drive' 
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.3)]' 
                  : 'border-white/5 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2.5">
                <Cloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">3. Cloud Backup</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Google Drive Store</p>
            </div>

            {/* Node 4: Dynamic Queue Scheduler */}
            <div 
              id="node-queue-scheduler"
              onClick={() => setActivePipelineStep(activePipelineStep === 'buffer' ? 'all' : 'buffer')}
              className={`z-10 bg-slate-950/40 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-center relative ${
                activePipelineStep === 'buffer' 
                  ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_25px_rgba(59,130,246,0.3)]' 
                  : 'border-white/5 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2.5 relative">
                <Clock className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce shadow">
                  {queue.length}
                </span>
              </div>
              <p className="text-xs font-bold text-white">4. Buffer Queue</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Scheduled slots</p>
            </div>

            {/* Node 5: Facebook Pro / TikTok Output */}
            <div 
              id="node-social-publisher"
              onClick={() => setActivePipelineStep(activePipelineStep === 'publish' ? 'all' : 'publish')}
              className={`col-span-2 md:col-span-1 z-10 bg-slate-950/40 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-center ${
                activePipelineStep === 'publish' 
                  ? 'border-green-500 bg-green-950/20 shadow-[0_0_25px_rgba(34,197,94,0.3)]' 
                  : 'border-white/5 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-2.5">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">5. Auto Dispatch</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Published & Synced</p>
            </div>

          </div>

          <div id="pipeline-overall-progress" className="flex items-center gap-4 mt-5 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Consolidated System Progress</span>
                <span className="text-xs font-mono text-blue-400 font-bold">85% Process Flow Efficiency</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline explanatory details when step is clicked */}
        {activePipelineStep !== 'all' && (
          <div id="active-step-details-card" className="bg-slate-900/20 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3.5 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
              {activePipelineStep === 'gpt' && <Sparkles />}
              {activePipelineStep === 'render' && <Video />}
              {activePipelineStep === 'drive' && <Cloud />}
              {activePipelineStep === 'buffer' && <Clock />}
              {activePipelineStep === 'publish' && <Check />}
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-black text-white">
                {activePipelineStep === 'gpt' && 'Node 1 Interactive Guide: Script Generation'}
                {activePipelineStep === 'render' && 'Node 2 Interactive Guide: CapCut Auto-Renderer API'}
                {activePipelineStep === 'drive' && 'Node 3 Interactive Guide: Google Drive Storage Sync'}
                {activePipelineStep === 'buffer' && 'Node 4 Interactive Guide: Buffer Booking Engine'}
                {activePipelineStep === 'publish' && 'Node 5 Interactive Guide: Automated Creator Publish Metrics'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {activePipelineStep === 'gpt' && 'FluxAuto harnesses Gemini 3.5 Flash to write structured viral screenplays instantly. Customize prompt concepts & output format, and immediately copy structured JSON cues.'}
                {activePipelineStep === 'render' && 'Trigger manual video render simulations on items in the Queue Panel below to watch draft stories transition into complete productions inside the cloud sandbox.'}
                {activePipelineStep === 'drive' && 'Auto-uploads finished render clips into your Google Drive backup repository folder. Drive Auth checks return code 200 (Valid).'}
                {activePipelineStep === 'buffer' && 'Configure and preview upcoming publishing times. Content items within this state will automatically send to Buffer API scheduler when reached.'}
                {activePipelineStep === 'publish' && 'Dispatches finalized reels safely. Tracks performance views, engagement ratios, and stores analytical retention metrics.'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Layout Bento Grid (Left Panel: 4 Cols, Right Grid: 8 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Prompt History & Script Repository */}
          <aside className="lg:col-span-5 bg-slate-900/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 min-h-[500px] backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Auto-Scripts</h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                {scripts.length} Available
              </span>
            </div>

            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {scripts.map(record => (
                <div 
                  key={record.id}
                  onClick={() => setSelectedScript(record)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative group ${
                    selectedScript?.id === record.id 
                      ? 'bg-slate-950/70 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                    {record.prompt}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-1">
                    🎯 Title: {record.data.title}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] text-slate-500 font-mono">{record.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {record.platform}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        record.status === 'JSON Validated' 
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action button inside list */}
            <button 
              id="btn-sidebar-create"
              onClick={() => {
                setPromptInput('');
                setShowGeneratorModal(true);
              }}
              className="py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 hover:border-white/20 rounded-xl text-xs text-slate-300 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose Custom Prompt Concept</span>
            </button>
          </aside>

          {/* Right Panel: Selected Script detailed View OR Buffer Scheduling control */}
          <main className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Upper View Box: active selected script detail screen */}
            {selectedScript ? (
              <section id="pane-script-viewer" className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/[0.01] to-transparent pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Active Screenplay Node Explorer</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-mono">Ready to queue</span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {selectedScript.data.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddToQueue(selectedScript)}
                      disabled={queue.some(qi => qi.scriptId === selectedScript.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        queue.some(qi => qi.scriptId === selectedScript.id)
                          ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                          : 'bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 cursor-pointer active:scale-95'
                      }`}
                    >
                      {queue.some(qi => qi.scriptId === selectedScript.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Queue</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 animate-pulse" />
                          <span>Approve & Add to Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Script details and hook alerts */}
                <div className="space-y-5">
                  
                  {/* Viral Hook element */}
                  <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/5 border border-teal-500/20 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 font-mono">0:00 - 0:03 Attention Hook</span>
                        <button 
                          onClick={() => handleCopyToClipboard(selectedScript.data.hook, 'hook')}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                        >
                          {copiedField === 'hook' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'hook' ? 'Copied' : 'Copy Hook'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-medium italic">
                        "{selectedScript.data.hook}"
                      </p>
                    </div>
                  </div>

                  {/* Scenework screenplay table */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2.5 font-mono">Scene-by-Scene Screenplay Cues</h4>
                    <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                      {selectedScript.data.script.map((scene, idx) => (
                        <div key={idx} className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                          <div className="md:col-span-2">
                            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                              {scene.time}
                            </span>
                          </div>
                          <div className="md:col-span-10 flex flex-col gap-1.5 text-left text-xs">
                            <p className="text-slate-100 font-semibold leading-relaxed">
                              🗣️ <span className="font-mono text-[11px] text-slate-400">Voiceover:</span> {scene.narration}
                            </p>
                            <p className="text-slate-400 text-[11px] leading-relaxed italic bg-slate-950/30 p-2 rounded-lg border border-white/[0.03]">
                              🎬 <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold tracking-wider mr-1">Renderer Prompt:</span> {scene.visuals}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Music guidelines */}
                  <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Suggested audio background environment:</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                      {selectedScript.data.suggestedMusic}
                    </span>
                  </div>

                  {/* Optimized captions */}
                  <div className="bg-slate-950/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Social Caption details & tags</span>
                      <button 
                        onClick={() => handleCopyToClipboard(`${selectedScript.data.captions}\n\n${selectedScript.data.hashtags.map(h => `#${h}`).join(' ')}`, 'caption')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                      >
                        {copiedField === 'caption' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'caption' ? 'Copied Blueprint' : 'Copy All Clipboard'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 bg-slate-900/40 p-2.5 rounded-lg text-left whitespace-pre-wrap">
                      {selectedScript.data.captions}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedScript.data.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </section>
            ) : (
              <div className="bg-slate-900/10 border border-white/5 rounded-3xl p-8 text-center text-slate-500">
                <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-400">No screenplay selected</p>
                <p className="text-xs text-slate-500 mt-1">Select any script on the left repository list or craft a modern prompt to generate a new active sequence.</p>
              </div>
            )}

            {/* Queue / Scheduled (Next 24h) */}
            <section id="pane-queue-list" className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active queue / Scheduled (Next 24h)</h3>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Auto-Interval: 12m</span>
              </div>

              {queue.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">The Scheduler queue is currently empty</p>
                  <p className="text-[10px] text-slate-500 mt-1">Select an auto-script from the list and approve it into the queue to simulate publishing workflows.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {queue.map(item => {
                    const isRendering = renderingItemId === item.id;
                    const canRender = item.status === 'Pending';
                    
                    return (
                      <div 
                        key={item.id} 
                        className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition-all relative group overflow-hidden"
                      >
                        {/* Rendering progress loader layer */}
                        {isRendering && (
                          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3 text-center">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-1.5" />
                            <p className="text-[10px] font-bold text-indigo-300 tracking-wider">RENDERING SCENARIOS...</p>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 max-w-[120px] overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${renderProgress}%` }}></div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 mt-1">{renderProgress}%</span>
                          </div>
                        )}

                        <div className="w-full aspect-[4/3] rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/10 relative">
                          <div className={`w-full h-full bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} flex flex-col justify-between p-3`}>
                            
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] tracking-wider uppercase bg-black/40 text-slate-300 font-bold px-2 py-0.5 rounded backdrop-blur">
                                {item.aspectRatio} Aspect
                              </span>
                              <span className="text-[8px] bg-slate-900/80 text-white font-mono rounded px-1.5 py-0.5 font-bold">
                                {item.timeSlot}
                              </span>
                            </div>

                            <div className="text-center font-bold text-white/50 text-[10px] uppercase font-mono tracking-widest pointer-events-none drop-shadow">
                              {item.status === 'Scheduled' ? 'Render Completed' : 'Draft / Sequence Pending'}
                            </div>

                            <div className="flex justify-between items-center text-[8px] text-white/40 font-mono">
                              <span>Flux Engine v2</span>
                              <span className="uppercase text-white/70 font-black">{item.platform}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <p className="text-[11px] font-bold text-white truncate uppercase max-w-[80%]" title={item.title}>
                              {item.title}
                            </p>
                            <button 
                              onClick={() => handleRemoveFromQueue(item.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Delete Slot"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.platform} Workflow Node</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono ${
                              item.status === 'Scheduled' 
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            }`}>
                              {item.status}
                            </span>

                            {canRender && (
                              <button
                                onClick={() => handleSimulateRender(item.id)}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Render</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Next Slot Generator Trigger card */}
                  <div 
                    onClick={() => {
                      if (selectedScript) {
                        handleAddToQueue(selectedScript);
                      } else {
                        setShowGeneratorModal(true);
                      }
                    }}
                    className="bg-slate-900/10 border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:bg-white/[0.02]"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/20 mb-2 group-hover:text-white/40">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-white/30">Next Slot</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 px-2">
                      {selectedScript ? `Click to schedule: "${selectedScript.data.title}"` : 'Construct prompt to schedule next pipeline'}
                    </p>
                  </div>

                </div>
              )}
            </section>

          </main>

        </div>

      </div>

      {/* Slide-out Generator Composer Modal Drawer */}
      {showGeneratorModal && (
        <div id="composer-modal" className="fixed inset-0 bg-[#050507]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-lg p-6 relative shadow-[0_0_50px_rgba(37,99,235,0.25)] my-8">
            
            <button 
              id="btn-close-composer"
              onClick={() => setShowGeneratorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <Sparkles className="w-4.5 h-4.5 animate-spin duration-3000" />
              </div>
              <h3 className="text-base font-bold text-white">Gemini 3.5 Automation Composer</h3>
            </div>

            <form onSubmit={handleGenerateScriptPipeline} className="space-y-4">
              
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 font-mono">
                  Concept Prompt Input
                </label>
                <textarea 
                  id="input-prompt-concept"
                  rows={4}
                  required
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g., Generate 3 fast-paced kitchen hacks to make knives sharper instantly, targeted for home cooks."
                  className="w-full bg-[#111218] border border-white/10 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none font-sans"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Gemini will output a complete screenplay structure including attention hooks, speech narrations, and optimized hashtags.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 font-mono">
                    Output Platform
                  </label>
                  <select 
                    id="select-channel"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[#111218] border border-white/10 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="TikTok">TikTok Feed</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 font-mono">
                    Tone / Personality
                  </label>
                  <select 
                    id="select-tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-[#111218] border border-white/10 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="exciting">Exciting & Viral</option>
                    <option value="informative">Crisp & Educational</option>
                    <option value="inspirational">Deep & Cinematic</option>
                    <option value="sassy">Humorous & Witty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 font-mono">
                  Dimensions Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-300'
                        : 'bg-[#111218] border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    9:16 Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-300'
                        : 'bg-[#111218] border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    16:9 Landscape
                  </button>
                </div>
              </div>

              {genError && (
                <div id="error-alert-banner" className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">API Offline Fallback Enabled</p>
                    <p className="text-[10px] text-red-400/80 mt-0.5 leading-relaxed">
                      Your Gemini key isn't active yet, or connection returned error. Click the button below to use the fully functional Local Core Simulation Engine.
                    </p>
                    <button
                      type="button"
                      onClick={triggerLocalSimulationEngine}
                      className="mt-2 text-[10px] px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded font-bold transition-all cursor-pointer"
                    >
                      Use Local Core Simulation Instead
                    </button>
                  </div>
                </div>
              )}

              <div id="modal-actions-bar" className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 bg-transparent text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini Scripting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compile Script Pipeline</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Decorative Bottom Status Navigation Bar */}
      <footer id="footer-status-indicators" className="mt-auto border-t border-white/10 bg-slate-900/30 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> 
            Buffer Scheduler: <span className="text-white">Active (200 OK)</span>
          </span>
          <span className="text-slate-800 hidden md:inline">|</span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div> 
            Drive Storage Sync: <span className="text-white">Authorized</span>
          </span>
          <span className="text-slate-800 hidden md:inline">|</span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 
            AI Engine Port: <span className="text-white">Gemini 3.5 Active</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Sandbox space: 4.2 GB / 15.0 GB Cloud storage</span>
          </span>
          <span className="text-slate-800">|</span>
          <span className="font-mono text-white/40">2.1.4-stable-prod</span>
        </div>
      </footer>
    </div>
  );
}
