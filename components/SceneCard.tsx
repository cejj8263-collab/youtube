import React from 'react';
import { Scene } from '../types';
import { RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon, Clock, Download } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  onRegenerate: (id: string) => void;
  index: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onRegenerate, index }) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg hover:border-slate-600 transition-colors flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:h-64 bg-slate-900 relative flex items-center justify-center group border-b md:border-b-0 md:border-r border-slate-700">
        {scene.status === 'completed' && scene.imageUrl ? (
          <>
            <img 
              src={scene.imageUrl} 
              alt={`장면 ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
              <button 
                onClick={() => window.open(scene.imageUrl, '_blank')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                title="크게 보기"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = scene.imageUrl!;
                  link.download = `scene-${index + 1}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                title="다운로드"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onRegenerate(scene.id)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                title="다시 생성"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full">
            {scene.status === 'pending' && (
               <div className="text-slate-500 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 mb-3 flex items-center justify-center text-slate-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">생성 대기 중...</span>
               </div>
            )}
            {scene.status === 'generating' && (
              <div className="flex flex-col items-center animate-pulse">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                <span className="text-indigo-400 font-medium text-sm">이미지 생성 중...</span>
              </div>
            )}
            {scene.status === 'error' && (
              <div className="text-red-400 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">생성 실패</span>
                <button 
                  onClick={() => onRegenerate(scene.id)}
                  className="mt-3 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/20 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`
            px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm
            ${scene.status === 'completed' ? 'bg-green-500/20 border-green-500/30 text-green-300' : ''}
            ${scene.status === 'generating' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : ''}
            ${scene.status === 'pending' ? 'bg-slate-500/20 border-slate-500/30 text-slate-300' : ''}
            ${scene.status === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' : ''}
          `}>
            장면 {index + 1}
          </div>
        </div>
      </div>

      {/* Text Section */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-slate-800">
        <div>
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center">
             장면 설명
             {scene.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400 ml-2" />}
          </h3>
          <p className="text-slate-300 leading-relaxed text-base">
            "{scene.originalText}"
          </p>
        </div>
        
        {scene.status === 'error' && (
           <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-xs text-red-400">
             오류: {scene.errorMsg || '알 수 없는 오류'}
           </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
           <span className="text-xs text-slate-500">StoryBoard AI</span>
           {scene.status === 'completed' && (
             <button 
               onClick={() => onRegenerate(scene.id)}
               className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
             >
               <RefreshCw className="w-3 h-3" />
               <span>다시 생성</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default SceneCard;