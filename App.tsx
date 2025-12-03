import React, { useState, useCallback, useEffect } from 'react';
import CharacterSetup from './components/CharacterSetup';
import ScriptInput from './components/ScriptInput';
import SceneCard from './components/SceneCard';
import { CharacterProfile, Scene, GenerationStatus } from './types';
import { generateSceneImage } from './services/geminiService';
import { Sparkles, Film, ArrowRight, Wand2 } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage on initial render
    return localStorage.getItem('gemini_api_key') || '';
  });
  
  const [character, setCharacter] = useState<CharacterProfile>({
    name: '',
    description: '',
    imageBase64: null,
    mimeType: null,
  });

  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [globalStatus, setGlobalStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  // Helper to process sentences safely
  const splitScriptToSentences = (text: string): string[] => {
    // Basic split by punctuation followed by space or newline, filter empty
    // Splitting by ., !, ? followed by space or end of line
    return text.match(/[^.!?\n]+[.!?]?(\n|$)/g)?.map(s => s.trim()).filter(s => s.length > 0) || [];
  };

  // Step 1: Analyze Script
  const handleAnalyzeScript = () => {
    const sentenceList = splitScriptToSentences(script);
    if (sentenceList.length === 0) {
        alert("분석할 문장이 없습니다. 대본을 입력해주세요.");
        return;
    }

    const newScenes: Scene[] = sentenceList.map((text, idx) => ({
      id: `scene-${Date.now()}-${idx}`,
      originalText: text,
      status: 'pending'
    }));
    
    setScenes(newScenes);
    setIsAnalyzed(true);
  };

  const resetAnalysis = () => {
    setIsAnalyzed(false);
    setScenes([]);
    setGlobalStatus(GenerationStatus.IDLE);
  }

  // Step 2: Generate Images
  const handleStartGeneration = async () => {
    if (!apiKey) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }
    
    if (!character.name && !character.description && !character.imageBase64) {
         if (!confirm("캐릭터 설정이 비어있습니다. 캐릭터 없이 진행하시겠습니까?")) {
             return;
         }
    }

    setGlobalStatus(GenerationStatus.PROCESSING);
    
    // Process sequentially to avoid overwhelming browser/API
    for (let i = 0; i < scenes.length; i++) {
      // Only generate if pending or error
      if (scenes[i].status === 'completed') continue;

      const currentSceneId = scenes[i].id;
      
      // Update status to generating
      setScenes(prev => prev.map(s => s.id === currentSceneId ? { ...s, status: 'generating' } : s));

      try {
        const imageUrl = await generateSceneImage(scenes[i].originalText, character, apiKey);
        
        setScenes(prev => prev.map(s => 
          s.id === currentSceneId 
            ? { ...s, status: 'completed', imageUrl } 
            : s
        ));
      } catch (err: any) {
        setScenes(prev => prev.map(s => 
          s.id === currentSceneId 
            ? { ...s, status: 'error', errorMsg: err.message } 
            : s
        ));
      }
    }
    
    setGlobalStatus(GenerationStatus.COMPLETED);
  };

  const handleRegenerateScene = useCallback(async (id: string) => {
    const sceneToRegen = scenes.find(s => s.id === id);
    if (!sceneToRegen) return;

    setScenes(prev => prev.map(s => s.id === id ? { ...s, status: 'generating', errorMsg: undefined } : s));

    try {
      const imageUrl = await generateSceneImage(sceneToRegen.originalText, character, apiKey);
      setScenes(prev => prev.map(s => 
        s.id === id 
          ? { ...s, status: 'completed', imageUrl } 
          : s
      ));
    } catch (err: any) {
      setScenes(prev => prev.map(s => 
        s.id === id 
          ? { ...s, status: 'error', errorMsg: err.message } 
          : s
      ));
    }
  }, [scenes, character]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              스토리보드 AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
             <input
               type="password"
               placeholder="Gemini API 키 입력"
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 w-48"
             />
             <div className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <Sparkles className="w-3 h-3 text-yellow-500 mr-1" />
                <span>Powered by Gemini 2.5 Flash</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Character Setup */}
          <div className="lg:col-span-4 h-full">
            <CharacterSetup character={character} setCharacter={setCharacter} />
          </div>

          {/* Right Column: Script Input */}
          <div className="lg:col-span-8 h-full">
            <ScriptInput 
              script={script} 
              setScript={setScript} 
              onAnalyze={handleAnalyzeScript}
              isAnalyzed={isAnalyzed}
              resetAnalysis={resetAnalysis}
            />
          </div>
        </div>

        {/* Step 2 Action Area */}
        {isAnalyzed && scenes.length > 0 && (
            <div className="mb-12 animate-fade-in-up">
                <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 text-center backdrop-blur-sm relative overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">2단계: 이미지 생성</h3>
                    <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                        분석된 {scenes.length}개의 장면에 대해 이미지를 생성합니다.<br/>
                        설정된 캐릭터 '{character.name || '이름 없음'}'의 특징이 반영됩니다.
                    </p>
                    
                    <button
                        onClick={handleStartGeneration}
                        disabled={globalStatus === GenerationStatus.PROCESSING}
                        className={`
                            px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-3 mx-auto transition-all shadow-xl
                            ${globalStatus === GenerationStatus.PROCESSING
                                ? 'bg-slate-700 text-slate-400 cursor-wait'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 transform hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {globalStatus === GenerationStatus.PROCESSING ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>이미지 생성 중...</span>
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                <span>모든 장면 이미지 생성 시작</span>
                                <ArrowRight className="w-5 h-5 opacity-70" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* Results Section */}
        {scenes.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Film className="w-6 h-6 mr-2 text-indigo-400" />
                        스토리보드 결과
                        <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                            총 {scenes.length} 장면
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {scenes.map((scene, index) => (
                        <SceneCard 
                            key={scene.id} 
                            scene={scene} 
                            index={index}
                            onRegenerate={handleRegenerateScene}
                        />
                    ))}
                </div>
            </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-8 bg-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 StoryBoard AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;