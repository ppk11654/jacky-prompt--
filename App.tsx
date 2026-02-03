
import React, { useState, useCallback, useEffect } from 'react';
import type { Scene, Storyboard } from './types';
import { generateSpec } from './services/geminiService';
import SceneCard from './components/SceneCard';
import PlusIcon from './components/icons/PlusIcon';
import ClipboardIcon from './components/icons/ClipboardIcon';
import SaveIcon from './components/icons/SaveIcon';
import TrashIcon from './components/icons/TrashIcon';
import QuestionMarkCircleIcon from './components/icons/QuestionMarkCircleIcon';
import HistorySidebar from './components/HistorySidebar';

const STORAGE_KEY = 'storyboard-history-app';

const PROJECT_TYPES = [
  {
    value: 'Fullstack',
    label: '全端 (Fullstack)',
    description: '有畫面 + 有後端 API + 有資料庫。',
    example: '範例：會員系統、電商網站、部落格、SaaS 服務。',
    recommended: false,
    techDetails: 'Node.js + Express (前端) / Python FastAPI (後端) / SQLite'
  },
  {
    value: 'Frontend Only',
    label: '純前端 (Frontend Only)',
    description: '只有畫面，資料存在瀏覽器 (localStorage)。',
    example: '範例：公司官網、活動頁面、作品集。',
    techDetails: 'Node.js + Express + HTML/CSS/JS (無後端)'
  },
  {
    value: 'Backend Only',
    label: '純後端 (Backend Only)',
    description: '只有 API，沒有畫面。',
    example: '範例：資料 API、爬蟲程式、排程任務。',
    techDetails: 'Python FastAPI + SQLite (無前端)'
  }
];

const createEmptyScene = (): Scene => ({
  id: crypto.randomUUID(),
  title: '',
  objective: '',
  layout: '',
  interactions: '',
  references: '',
});

const loadStoryboardsFromStorage = (): Storyboard[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data) as Storyboard[];
      return parsedData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error("Failed to load storyboards from storage", error);
    return [];
  }
};

const saveStoryboardsToStorage = (storyboards: Storyboard[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
  } catch (error) {
    console.error("Failed to save storyboards to storage", error);
  }
};


const SpecResultModal: React.FC<{ spec: string; onClose: () => void }> = ({ spec, onClose }) => {
  const [copyText, setCopyText] = useState('複製全部 Prompt');

  useEffect(() => {
    setCopyText('複製全部 Prompt');
  }, [spec]);

  const handleCopy = () => {
    navigator.clipboard.writeText(spec).then(() => {
      setCopyText('已複製！');
      setTimeout(() => setCopyText('複製全部 Prompt'), 2000);
    }).catch(err => {
        console.error('Failed to copy spec: ', err);
        setCopyText('複製失敗');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-white">Michael Cursor Prompt Pack</h2>
            <p className="text-xs text-indigo-300 mt-1">請依照 P0 ~ P6 的順序，分段貼入 Cursor Composer 執行</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleCopy} className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
              <ClipboardIcon className="w-4 h-4" />
              <span>{copyText}</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-700 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="prose prose-invert max-w-none p-6 overflow-y-auto flex-grow bg-gray-900/90 rounded-b-lg font-mono text-sm leading-relaxed">
          <pre className="whitespace-pre-wrap break-words text-gray-300">{spec}</pre>
        </div>
      </div>
    </div>
  );
};

const Tooltip: React.FC<{ text: React.ReactNode }> = ({ text }) => (
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-300 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {text}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
  </div>
);

function App() {
  const [scenes, setScenes] = useState<Scene[]>([createEmptyScene()]);
  const [projectType, setProjectType] = useState('Fullstack');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<string | null>(null);
  
  const [storyboards, setStoryboards] = useState<Storyboard[]>(loadStoryboardsFromStorage);
  const [activeStoryboardId, setActiveStoryboardId] = useState<string | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    saveStoryboardsToStorage(storyboards);
  }, [storyboards]);

  const handleAddScene = () => {
    const newScene = createEmptyScene();
    setScenes(prev => [...prev, newScene]);
    setActiveSceneIndex(scenes.length); // Switch to the new scene
  };

  const handleUpdateScene = useCallback((index: number, updatedFields: Partial<Scene>) => {
    setScenes(currentScenes => 
      currentScenes.map((scene, i) => 
        i === index ? { ...scene, ...updatedFields } : scene
      )
    );
  }, []);
  
  const handleDeleteScene = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab switching when clicking delete
    if (scenes.length > 1) {
      setScenes(currentScenes => {
        const newScenes = [...currentScenes];
        newScenes.splice(index, 1);
        return newScenes;
      });
      // Adjust active index if needed
      if (activeSceneIndex >= index && activeSceneIndex > 0) {
        setActiveSceneIndex(prev => prev - 1);
      }
    }
  }, [scenes.length, activeSceneIndex]);

  const handleSaveStoryboard = () => {
    let newStoryboards = [...storyboards];
    const now = new Date().toISOString();
    
    // Default title if empty
    let title = scenes[0].title || '未命名專案';
    if (scenes.length > 1) {
       const filledTitle = scenes.find(s => s.title)?.title;
       if (filledTitle) title = filledTitle;
    }

    if (activeStoryboardId) {
      // Update existing
      newStoryboards = newStoryboards.map(sb => 
        sb.id === activeStoryboardId 
          ? { 
              ...sb, 
              title,
              scenes, 
              updatedAt: now, 
              projectType,
              generatedSpec: generatedSpec || sb.generatedSpec,
              generatedAt: generatedSpec ? now : sb.generatedAt
            } 
          : sb
      );
    } else {
      // Create new
      const newId = crypto.randomUUID();
      const newStoryboard: Storyboard = {
        id: newId,
        title,
        scenes,
        createdAt: now,
        updatedAt: now,
        generatedSpec,
        generatedAt: generatedSpec ? now : undefined,
        projectType,
      };
      newStoryboards = [newStoryboard, ...newStoryboards];
      setActiveStoryboardId(newId);
    }
    
    setStoryboards(newStoryboards);
    alert('分鏡腳本已儲存！');
  };

  const handleSelectStoryboard = (id: string) => {
    const selected = storyboards.find(sb => sb.id === id);
    if (selected) {
      setScenes(selected.scenes);
      setProjectType(selected.projectType || 'Fullstack');
      setGeneratedSpec(selected.generatedSpec || null);
      setActiveStoryboardId(selected.id);
      setActiveSceneIndex(0);
    }
  };

  const handleDeleteStoryboard = (id: string) => {
    if (confirm('確定要刪除此紀錄嗎？無法復原。')) {
      const newStoryboards = storyboards.filter(sb => sb.id !== id);
      setStoryboards(newStoryboards);
      if (activeStoryboardId === id) {
        handleNewStoryboard();
      }
    }
  };

  const handleNewStoryboard = () => {
    setScenes([createEmptyScene()]);
    setProjectType('Fullstack');
    setGeneratedSpec(null);
    setActiveStoryboardId(null);
    setActiveSceneIndex(0);
  };

  const handleGenerateSpec = async () => {
    // Basic validation
    if (scenes.some(s => !s.title && !s.objective)) {
      if(!confirm("部分場景資訊似乎未填寫完整，確定要開始生成嗎？")) return;
    }

    setIsLoading(true);
    try {
      const spec = await generateSpec(scenes, 'Auto', projectType);
      setGeneratedSpec(spec);
      
      // Auto-save when generated
      if (activeStoryboardId) {
         const now = new Date().toISOString();
         const newStoryboards = storyboards.map(sb => 
            sb.id === activeStoryboardId 
              ? { ...sb, generatedSpec: spec, generatedAt: now, updatedAt: now } 
              : sb
         );
         setStoryboards(newStoryboards);
      }
    } catch (error) {
      alert('生成失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <HistorySidebar 
        storyboards={storyboards}
        activeStoryboardId={activeStoryboardId}
        onSelect={handleSelectStoryboard}
        onDelete={handleDeleteStoryboard}
        onNew={handleNewStoryboard}
        onShowSpec={(spec) => setGeneratedSpec(spec)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center space-x-3">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-lg">M</span>
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Michael分鏡腳本小助手</h1>
                <p className="text-xs text-gray-400">專為小白設計的 Spec Coding 助手</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <button 
                onClick={handleSaveStoryboard}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md transition-colors text-sm font-medium"
             >
                <SaveIcon className="w-4 h-4" />
                <span>儲存進度</span>
             </button>
             <button
              onClick={handleGenerateSpec}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-white transition-all transform active:scale-95 shadow-lg ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>編譯中...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span>生成 Prompt Pack</span>
                </>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth pb-24">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Step 1: Project Type */}
            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
               <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-indigo-900 text-indigo-200 text-xs font-bold px-2 py-1 rounded">Step 1</span>
                  <h2 className="text-lg font-bold text-white">選擇專案類型</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {PROJECT_TYPES.map(type => (
                    <div 
                      key={type.value}
                      onClick={() => setProjectType(type.value)}
                      className={`cursor-pointer rounded-lg p-4 border-2 transition-all relative ${
                        projectType === type.value 
                          ? 'border-indigo-500 bg-indigo-900/20 shadow-md' 
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                      }`}
                    >
                       {type.recommended && (
                          <div className="absolute -top-3 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            推薦
                          </div>
                       )}
                       <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-200">{type.label}</span>
                          {projectType === type.value && (
                             <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                             </div>
                          )}
                       </div>
                       <p className="text-xs text-gray-400 mb-2">{type.description}</p>
                       <p className="text-[10px] text-gray-500">{type.example}</p>
                    </div>
                  ))}
               </div>
               
               {/* Auto Tech Stack Info Display */}
               <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                       </svg>
                       自動配置技術棧
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">根據您的選擇，系統已自動為您配置最適合的開發工具。</p>
                  </div>
                  <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-md">
                     <code className="text-sm text-indigo-200 font-mono">
                       {PROJECT_TYPES.find(t => t.value === projectType)?.techDetails}
                     </code>
                  </div>
               </div>
            </section>

            {/* Step 2: Scenes */}
            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                     <span className="bg-purple-900 text-purple-200 text-xs font-bold px-2 py-1 rounded">Step 2</span>
                     <h2 className="text-lg font-bold text-white">規劃分鏡腳本</h2>
                  </div>
                  <button 
                    onClick={handleAddScene}
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                  >
                     <PlusIcon className="w-4 h-4" />
                     <span>新增場景</span>
                  </button>
               </div>

               {/* Scene Tabs */}
               <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {scenes.map((scene, index) => (
                    <div 
                      key={scene.id}
                      onClick={() => setActiveSceneIndex(index)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
                        activeSceneIndex === index 
                          ? 'bg-gray-700 border-indigo-500 text-white' 
                          : 'bg-gray-800 border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                      }`}
                    >
                      <span className="text-sm font-medium max-w-[100px] truncate">{scene.title || `場景 ${index + 1}`}</span>
                      {scenes.length > 1 && (
                        <button 
                          onClick={(e) => handleDeleteScene(index, e)}
                          className="text-gray-500 hover:text-red-400 p-0.5 rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={handleAddScene}
                    className="px-2 py-2 text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
               </div>

               {/* Active Scene Card */}
               <div className="bg-gray-750/50 rounded-b-lg rounded-tr-lg p-1">
                 {scenes[activeSceneIndex] && (
                   <SceneCard 
                     key={scenes[activeSceneIndex].id}
                     scene={scenes[activeSceneIndex]}
                     index={activeSceneIndex}
                     onUpdate={handleUpdateScene}
                   />
                 )}
               </div>
            </section>
          </div>
        </main>

        {generatedSpec && (
          <SpecResultModal 
            spec={generatedSpec} 
            onClose={() => setGeneratedSpec(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
