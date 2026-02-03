import React from 'react';
import type { Storyboard } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface HistorySidebarProps {
  storyboards: Storyboard[];
  activeStoryboardId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onShowSpec: (spec: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ storyboards, activeStoryboardId, onSelect, onDelete, onNew, onShowSpec }) => {
  return (
    <aside className="bg-gray-800/50 border-r border-gray-700 w-80 h-full flex flex-col p-4 shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">歷史紀錄</h2>
      </div>
      <button
        onClick={onNew}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 mb-4"
      >
        <PlusIcon className="w-4 h-4" />
        <span>新增分鏡腳本</span>
      </button>
      <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-2">
        {storyboards.length === 0 && (
          <div className="text-center text-gray-500 mt-8 px-2">
            <p>尚未儲存任何分鏡腳本。</p>
            <p className="text-sm mt-1">編輯後點擊「儲存」按鈕來新增紀錄。</p>
          </div>
        )}
        {storyboards.map((storyboard) => (
          <div
            key={storyboard.id}
            onClick={() => onSelect(storyboard.id)}
            className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeStoryboardId === storyboard.id
                ? 'bg-indigo-600/30 ring-2 ring-indigo-500'
                : 'bg-gray-700/50 hover:bg-gray-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-white truncate">{storyboard.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {storyboard.scenes.length} 個場景
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  更新於：{new Date(storyboard.updatedAt).toLocaleDateString()}
                </p>
                {storyboard.generatedAt && (
                  <p className="text-xs text-indigo-400/80 mt-1">
                    規格產生於：{new Date(storyboard.generatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center ml-2 shrink-0">
                {storyboard.generatedSpec && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowSpec(storyboard.generatedSpec!);
                    }}
                    className="text-gray-400 hover:text-indigo-400 transition-colors p-1.5 rounded-full"
                    aria-label="查看已生成的規格"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(storyboard.id);
                  }}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-full"
                  aria-label={`刪除 ${storyboard.title}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default HistorySidebar;