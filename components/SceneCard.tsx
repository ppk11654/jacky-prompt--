
import React from 'react';
import type { Scene } from '../types';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';

interface SceneCardProps {
  scene: Scene;
  index: number;
  onUpdate: (index: number, updatedScene: Partial<Scene>) => void;
}

const Tooltip: React.FC<{ text: React.ReactNode }> = ({ text }) => (
  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-300 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {text}
    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
  </div>
);

const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
  </div>
);

const TextareaField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  tooltip?: React.ReactNode;
}> = ({ label, placeholder, value, onChange, tooltip }) => (
  <div>
    <div className="flex items-center space-x-2 mb-1">
      <label className="block text-sm font-medium text-indigo-300">{label}</label>
      {tooltip && (
        <div className="group relative cursor-help">
          <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500 hover:text-indigo-400 transition-colors" />
          <Tooltip text={tooltip} />
        </div>
      )}
    </div>
    <textarea
      rows={4}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y"
    />
  </div>
);


const SceneCard: React.FC<SceneCardProps> = ({ scene, index, onUpdate }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <InputField 
          label="場景標題"
          placeholder="例如：使用者登入頁面"
          value={scene.title}
          onChange={(e) => onUpdate(index, { title: e.target.value })}
      />
      <div className="grid grid-cols-1 gap-6">
        <TextareaField
            label="目標 / 使用者故事"
            placeholder="例如：身為一個使用者，我希望能使用電子郵件和密碼登入，以存取我的儀表板。"
            value={scene.objective}
            onChange={(e) => onUpdate(index, { objective: e.target.value })}
        />
        <TextareaField
            label="版面與視覺設計"
            placeholder="例如：頁面中央有一個卡片，頂部是 Logo。Logo 下方有兩個輸入欄位，分別是「電子郵件」和「密碼」，底部有一個「登入」按鈕。"
            value={scene.layout}
            onChange={(e) => onUpdate(index, { layout: e.target.value })}
        />
        <TextareaField
            label="互動與行為"
            placeholder="例如：當點擊「登入」按鈕時，驗證欄位。若無效，在對應欄位下顯示錯誤訊息。若有效，在按鈕上顯示載入圖示，並在成功後導向到儀表板頁面。"
            value={scene.interactions}
            onChange={(e) => onUpdate(index, { interactions: e.target.value })}
        />
        <TextareaField
            label="參考資料 / API 文件 (本場景專用)"
            placeholder="請貼上與此場景相關的 API 連結或 UI 參考網址。例如：&#10;- https://stripe.com/docs/api (為了付款功能)&#10;- https://maps.google.com/docs (為了地圖顯示)"
            value={scene.references || ''}
            onChange={(e) => onUpdate(index, { references: e.target.value })}
            tooltip="在此貼上 Cursor 需要閱讀的文件連結。例如：如果您這個頁面要串接 Google Maps，請貼上 Maps API 文件；如果要刻一個複雜的 Table，可以貼上 UI Library 的範例連結。"
        />
      </div>
    </div>
  );
};

export default SceneCard;