
import React from 'react';
import { SectionDetail, ActivityItem } from '../types';

interface SectionProps {
  sectionDetail: SectionDetail;
  formatCurrency: (value?: number, currencyCode?: string) => string;
  isEditMode: boolean;
  dayIndex: number;
  sectionIndex: number;
  onOpenAddActivityModal: (dayIndex: number, sectionIndex: number) => void;
  onOpenEditActivityModal: (dayIndex: number, sectionIndex: number, activity: ActivityItem) => void; // New prop
  onDeleteActivity: (dayIndex: number, sectionIndex: number, activityId: string) => void;
}

const getIconForType = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'activity': return '📍';
    case 'food': return '🍲';
    case 'transport': return '🚗';
    case 'note': return '📌';
    case 'interaction': return '💬';
    default: return '🔹';
  }
};

export const Section: React.FC<SectionProps> = ({ 
  sectionDetail, 
  formatCurrency,
  isEditMode,
  dayIndex,
  sectionIndex,
  onOpenAddActivityModal,
  onOpenEditActivityModal, // Destructure new prop
  onDeleteActivity
}) => {
  const { title, items } = sectionDetail;

  if (!items || items.length === 0 && !isEditMode) { 
    return null;
  }

  return (
    <div className={`py-3.5 ${items.length > 0 || isEditMode ? 'border-b border-slate-200/80 last:border-b-0' : ''}`}>
      <h4 className="text-lg font-semibold text-slate-800 mb-3.5">{title}</h4>
      {items.length === 0 && isEditMode && (
        <p className="text-sm text-slate-500 italic mb-3">Chưa có hoạt động nào trong mục này.</p>
      )}
      <ul className="space-y-3 pl-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-start text-sm group">
            <span className="mr-3 pt-0.5 text-xl leading-none">
              {item.icon || getIconForType(item.type)}
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-slate-700 leading-relaxed pr-2">{item.description}</p>
                {item.estimatedCost !== undefined && item.currency && !isEditMode && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    ~ {formatCurrency(item.estimatedCost, item.currency)}
                  </span>
                )}
                 {isEditMode && item.estimatedCost !== undefined && item.currency && (
                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {formatCurrency(item.estimatedCost, item.currency)}
                  </span>
                 )}
              </div>
              {item.details && <p className="text-xs text-slate-500 mt-1">{item.details}</p>}
            </div>
            {isEditMode && (
              <div className="flex items-center shrink-0 ml-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => onOpenEditActivityModal(dayIndex, sectionIndex, item)}
                  className="p-1 text-sky-600 hover:text-sky-800"
                  aria-label={`Chỉnh sửa hoạt động: ${item.description}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteActivity(dayIndex, sectionIndex, item.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Xóa hoạt động: ${item.description}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.177-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {isEditMode && (
        <div className="mt-4 text-right">
          <button
            onClick={() => onOpenAddActivityModal(dayIndex, sectionIndex)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1 inline">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            Thêm Hoạt động
          </button>
        </div>
      )}
    </div>
  );
};
