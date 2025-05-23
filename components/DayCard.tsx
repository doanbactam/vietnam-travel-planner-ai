
import React from 'react';
import { DayPlan, DailyNote, TrendySuggestion, AccommodationSuggestion } from '../types';
import { Section } from './Section';

interface DayCardProps {
  dayPlan: DayPlan;
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

const renderAccommodationSuggestion = (suggestion?: AccommodationSuggestion) => {
  if (!suggestion) return null;
  return (
    <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
        <span className="mr-2 text-base">🏨</span>Gợi ý lưu trú:
      </h4>
      <p className="text-xs text-slate-700">
        <strong className="font-medium">{suggestion.type}:</strong> {suggestion.details}
      </p>
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ dayPlan }) => {
  const { dayNumber, date, title, summary, sections, dailyNotes, trendySuggestion, accommodationSuggestion } = dayPlan;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6 bg-teal-600 text-white">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          {date}: {title}
        </h3>
        {summary && <p className="mt-1.5 text-sm text-teal-100 opacity-90">{summary}</p>}
      </div>
      
      <div className="p-5 sm:p-6 space-y-5">
        {sections.map((section, index) => (
          <Section key={`${dayNumber}-section-${index}`} sectionDetail={section} />
        ))}
        
        {renderDailyNotes(dailyNotes)}
        {renderTrendySuggestion(trendySuggestion)}
        {renderAccommodationSuggestion(accommodationSuggestion)}
      </div>
    </div>
  );
};