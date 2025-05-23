
import React from 'react';
import { DayPlan, DailyNote, TrendySuggestion, AccommodationSuggestion, ActivityItem } from '../types'; 
import { Section } from './Section';

interface DayCardProps {
  dayPlan: DayPlan;
  formatCurrency: (value?: number, currencyCode?: string) => string;
  isEditMode: boolean;
  dayIndex: number; 
  onOpenAddActivityModal: (dayIndex: number, sectionIndex: number) => void;
  onOpenEditActivityModal: (dayIndex: number, sectionIndex: number, activity: ActivityItem) => void; // New prop
  onDeleteActivity: (dayIndex: number, sectionIndex: number, activityId: string) => void;
}

const renderDailyNotes = (notes?: DailyNote[]) => {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
        <span className="mr-2 text-base">📝</span>Lưu ý cho ngày:
      </h4>
      <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
        {notes.map((note, index) => (
          <li key={`daily-note-${index}`} className="flex items-start">
            {note.icon && <span className="mr-1.5 pt-px">{note.icon}</span>}
            <span>{note.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderTrendySuggestion = (suggestion?: TrendySuggestion) => {
  if (!suggestion) return null;
  return (
    <div className="mt-4 p-3.5 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
        {suggestion.icon && <span className="mr-2 text-base">{suggestion.icon}</span>}
        {suggestion.title}
      </h4>
      <p className="text-xs text-slate-700">{suggestion.description}</p>
    </div>
  );
};

const renderAccommodationSuggestion = (
    suggestion?: AccommodationSuggestion, 
    formatCurrency?: (value?: number, currencyCode?: string) => string
) => {
  if (!suggestion) return null;
  let priceDisplay = '';
  if (formatCurrency && suggestion.minPrice !== undefined && suggestion.priceCurrency) {
    if (suggestion.maxPrice !== undefined && suggestion.maxPrice > suggestion.minPrice) {
      priceDisplay = ` (~ ${formatCurrency(suggestion.minPrice, suggestion.priceCurrency)} - ${formatCurrency(suggestion.maxPrice, suggestion.priceCurrency)}/đêm)`;
    } else {
      priceDisplay = ` (~ ${formatCurrency(suggestion.minPrice, suggestion.priceCurrency)}/đêm)`;
    }
  }

  return (
    <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
        <span className="mr-2 text-base">🏨</span>Gợi ý lưu trú:
      </h4>
      <p className="text-xs text-slate-700">
        <strong className="font-medium">{suggestion.type}:</strong> {suggestion.details}
        {priceDisplay && <span className="text-indigo-700 font-medium">{priceDisplay}</span>}
      </p>
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ 
  dayPlan, 
  formatCurrency,
  isEditMode,
  dayIndex,
  onOpenAddActivityModal,
  onOpenEditActivityModal, // Destructure new prop
  onDeleteActivity
}) => {
  const { dayNumber, date, title, summary, sections, dailyNotes, trendySuggestion, accommodationSuggestion, estimatedDailyCost, dailyCostCurrency } = dayPlan;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6 bg-teal-600 text-white">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
            <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {date}: {title}
                </h3>
                {summary && <p className="mt-1.5 text-sm text-teal-100 opacity-90 max-w-xl">{summary}</p>}
            </div>
            {estimatedDailyCost !== undefined && dailyCostCurrency && !isEditMode && ( 
                <div className="mt-3 sm:mt-0 sm:ml-4 text-right shrink-0">
                    <p className="text-xs text-teal-200">Chi phí ngày (ước tính):</p>
                    <p className="text-lg font-semibold text-white">
                        {formatCurrency(estimatedDailyCost, dailyCostCurrency)}
                    </p>
                </div>
            )}
        </div>
      </div>
      
      <div className="p-5 sm:p-6 space-y-5">
        {sections.map((section, sectionIndex) => (
          <Section 
            key={`${dayNumber}-section-${sectionIndex}`} 
            sectionDetail={section} 
            formatCurrency={formatCurrency}
            isEditMode={isEditMode}
            dayIndex={dayIndex}
            sectionIndex={sectionIndex}
            onOpenAddActivityModal={onOpenAddActivityModal}
            onOpenEditActivityModal={onOpenEditActivityModal} // Pass prop
            onDeleteActivity={onDeleteActivity}
          />
        ))}
        
        {!isEditMode && ( 
          <>
            {renderDailyNotes(dailyNotes)}
            {renderTrendySuggestion(trendySuggestion)}
            {renderAccommodationSuggestion(accommodationSuggestion, formatCurrency)}
          </>
        )}
      </div>
    </div>
  );
};
