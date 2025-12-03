import React, { useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { CharacterProfile } from '../types';

interface CharacterSetupProps {
  character: CharacterProfile;
  setCharacter: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

const CharacterSetup: React.FC<CharacterSetupProps> = ({ character, setCharacter }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        setCharacter(prev => ({
          ...prev,
          imageBase64: base64Data,
          mimeType: mimeType
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCharacter(prev => ({ ...prev, imageBase64: null, mimeType: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg space-y-6 h-full">
      <div className="flex items-center space-x-3 mb-2">
        <User className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">캐릭터 설정</h2>
      </div>
      
      <p className="text-slate-400 text-sm">
        이미지 생성에 사용할 주인공 캐릭터를 설정하세요. 설정된 캐릭터의 외형이 모든 장면에 일관되게 반영됩니다.
      </p>

      {/* Image Uploader */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">참조 이미지 (선택)</label>
        
        {!character.imageBase64 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-colors group"
          >
            <div className="p-3 bg-slate-700 rounded-full mb-3 group-hover:bg-slate-600 transition-colors">
              <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-slate-300 font-medium">캐릭터 이미지 업로드</p>
            <p className="text-slate-500 text-xs mt-1">PNG, JPG (최대 5MB)</p>
          </div>
        ) : (
          <div className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden border border-slate-600 group">
            <img 
              src={`data:${character.mimeType};base64,${character.imageBase64}`} 
              alt="Character Reference" 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-xs text-center text-white backdrop-blur-sm">
              참조 이미지 등록됨
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">캐릭터 이름</label>
        <input
          type="text"
          value={character.name}
          onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
          placeholder="예: 철수, 용사 김씨"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">외형 묘사</label>
        <textarea
          value={character.description}
          onChange={(e) => setCharacter(prev => ({ ...prev, description: e.target.value }))}
          placeholder="머리색, 눈 색깔, 의상 등 캐릭터의 특징을 자세히 적어주세요..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
};

export default CharacterSetup;