
import React, { useState } from 'react';
import { ItineraryData, GeneralNote, FinalThoughtItem, DayPlan, ActivityItem } from '../types'; 
import { DayCard } from './DayCard';
import { ItineraryMap } from './ItineraryMap';

interface ItineraryDisplayProps {
  itineraryData: ItineraryData;
  googleMapsApiAvailable: boolean;
  onOpenFeedback: () => void; 
  feedbackSubmitted: boolean; 
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddActivityModal: (dayIndex: number, sectionIndex: number) => void;
  onOpenEditActivityModal: (dayIndex: number, sectionIndex: number, activity: ActivityItem) => void; // New prop
  onDeleteActivity: (dayIndex: number, sectionIndex: number, activityId: string) => void;
}

const TAB_THRESHOLD = 7; 

const formatCurrency = (value?: number, currencyCode: string = "VND"): string => {
  if (value === undefined || value === null) return '';
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currencyCode }).format(value);
  } catch (e) {
    return `${value.toLocaleString('vi-VN')} ${currencyCode}`;
  }
};

const renderGeneralNotes = (notes?: GeneralNote[]) => {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
      <h3 className="text-lg font-semibold text-sky-700 mb-2.5 flex items-center">
        <span className="mr-2 text-xl">💡</span>Lưu ý chung
      </h3>
      <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 pl-1">
        {notes.map((note, index) => (
          <li key={`general-note-${index}`} className="flex items-start">
            {note.icon && <span className="mr-2 pt-0.5">{note.icon}</span>}
            <span className={note.type === 'important' ? 'font-semibold text-red-600' : ''}>{note.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderFinalThoughtsSection = (title: string, items?: FinalThoughtItem[], icon?: string) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold text-teal-700 mb-2 flex items-center">
        {icon && <span className="mr-2 text-lg">{icon}</span>}
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((item, index) => (
          <li key={`final-tip-${index}`} className="p-2.5 bg-slate-50 rounded-md shadow-sm">
            <strong className="text-slate-700 flex items-center">
                {item.icon && <span className="mr-1.5 text-base">{item.icon}</span>}
                {item.title}:
            </strong> 
            <span className="block mt-0.5 pl-1">{item.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};


export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ 
  itineraryData, 
  googleMapsApiAvailable,
  onOpenFeedback,
  feedbackSubmitted,
  isEditMode,
  onToggleEditMode,
  onOpenAddActivityModal,
  onOpenEditActivityModal, // Destructure new prop
  onDeleteActivity
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!itineraryData) return null;

  const { title, overview, generalNotes, days, finalThoughts, feasibilityWarning, mapData, estimatedTotalCost, totalCostCurrency, costDisclaimer } = itineraryData;
  const showTabs = days.length > TAB_THRESHOLD;

  const renderDayCards = () => {
    if (showTabs) {
      const activeDayPlan = days[activeTab];
      return activeDayPlan ? (
        <DayCard 
            key={`${activeDayPlan.dayNumber}-${activeTab}`}
            dayPlan={activeDayPlan} 
            formatCurrency={formatCurrency}
            isEditMode={isEditMode}
            dayIndex={activeTab} 
            onOpenAddActivityModal={onOpenAddActivityModal}
            onOpenEditActivityModal={onOpenEditActivityModal} // Pass prop
            onDeleteActivity={onDeleteActivity}
        />
      ) : null;
    }
    return days.map((dayPlan, index) => (
      <DayCard 
        key={dayPlan.dayNumber} 
        dayPlan={dayPlan} 
        formatCurrency={formatCurrency}
        isEditMode={isEditMode}
        dayIndex={index} 
        onOpenAddActivityModal={onOpenAddActivityModal}
        onOpenEditActivityModal={onOpenEditActivityModal} // Pass prop
        onDeleteActivity={onDeleteActivity}
      />
    ));
  };

  return (
    <div className="mt-12 pt-10 border-t border-slate-300/80">
      <div className="mb-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-teal-700 mb-3 tracking-tight">{title}</h2>
        {overview && <p className="text-md text-slate-600 max-w-2xl mx-auto">{overview}</p>}
      </div>

      <div className="mb-6 flex justify-end items-center">
          <label htmlFor="editModeToggle" className="mr-3 text-sm font-medium text-slate-700">
            Chế độ Chỉnh sửa:
          </label>
          <button
            id="editModeToggle"
            onClick={onToggleEditMode}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isEditMode 
                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400' 
                : 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400'
              }`}
          >
            {isEditMode ? (
                 <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline">
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                    Hoàn tất
                 </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline">
                     <path d="m2.695 14.763 7.275-7.275a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1 0 .707l-7.275 7.275a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 0-.707zm.536-9.536a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 0-.707l1.414-1.414zM14.5 7a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z" />
                    </svg>
                    Chỉnh sửa
                </>
            )}
          </button>
        </div>

      {estimatedTotalCost !== undefined && totalCostCurrency && (
        <div className="mb-8 p-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg shadow-md">
          <div className="flex items-center">
             <span className="text-2xl mr-3">💰</span>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">
                Tổng chi phí ước tính:
              </h3>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(estimatedTotalCost, totalCostCurrency)}
              </p>
            </div>
          </div>
          {costDisclaimer && (
            <p className="mt-2.5 text-xs text-slate-600 italic">{costDisclaimer}</p>
          )}
        </div>
      )}


      {feasibilityWarning && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-md">
          <div className="flex">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{feasibilityWarning}</p>
            </div>
          </div>
        </div>
      )}

      {mapData && (mapData.points.length > 0 || mapData.routes.length > 0) && googleMapsApiAvailable && (
        <div className="mb-8">
           <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center sm:text-left">Bản đồ Lịch trình</h3>
          <ItineraryMap mapData={mapData} />
        </div>
      )}
      {!googleMapsApiAvailable && mapData && (mapData.points.length > 0 || mapData.routes.length > 0) && (
         <div className="mb-8 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center text-sm text-orange-700">
            <p>Tính năng bản đồ tạm thời chưa khả dụng do lỗi cấu hình API Key của Google Maps.</p>
            <p className="text-xs">Vui lòng kiểm tra lại thiết lập trong file <code>index.html</code>.</p>
        </div>
      )}

      {renderGeneralNotes(generalNotes)}

      {showTabs && (
        <div className="mb-6 border-b border-slate-300">
          <nav className="-mb-px flex space-x-1 sm:space-x-2 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent" aria-label="Tabs">
            {days.map((day, index) => (
              <button
                key={`${day.dayNumber}-${index}`}
                onClick={() => setActiveTab(index)}
                className={`shrink-0 whitespace-nowrap px-3 py-3 sm:px-4 text-sm font-medium rounded-t-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1
                  ${activeTab === index
                    ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50/70'
                    : 'border-b-2 border-transparent text-slate-500 hover:text-teal-600 hover:border-slate-400/70 hover:bg-slate-100/50'
                  }`}
                aria-current={activeTab === index ? 'page' : undefined}
              >
                {day.date || `Ngày ${day.dayNumber}`}
                {day.estimatedDailyCost !== undefined && day.dailyCostCurrency && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === index ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                    ~{formatCurrency(day.estimatedDailyCost, day.dailyCostCurrency).replace(/\sVND$/, '')}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className={showTabs ? '' : 'space-y-10'}>
        {renderDayCards()}
      </div>

      {finalThoughts && (
        <div className="mt-12 pt-8 border-t border-slate-300/80">
          <h3 className="text-2xl font-bold text-slate-800 mb-5 text-center">Lời Khuyên & Thông Tin Thêm</h3>
          <div className="p-5 bg-slate-100/70 rounded-xl space-y-5 shadow">
            {renderFinalThoughtsSection("Mẹo Du Lịch Chung", finalThoughts.travelTips, "💡")}
            {renderFinalThoughtsSection("Văn Hóa & Giao Tiếp", finalThoughts.culturalInsights, "🤝")}
            {finalThoughts.bookingAdvice && (
              <div>
                <h4 className="text-md font-semibold text-teal-700 mb-2 flex items-center">
                   <span className="mr-2 text-lg">✈️</span>Lời Khuyên Đặt Dịch Vụ
                </h4>
                <p className="text-sm text-slate-600 p-2.5 bg-slate-50 rounded-md shadow-sm">{finalThoughts.bookingAdvice}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-slate-300/80 text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">
          Lịch trình này có hữu ích với bạn không?
        </h3>
        <p className="text-sm text-slate-600 mb-5 max-w-lg mx-auto">
          Hãy giúp chúng tôi cải thiện bằng cách để lại đánh giá và ý kiến của bạn.
          Mọi phản hồi đều quý giá!
        </p>
        <button
          onClick={onOpenFeedback}
          disabled={feedbackSubmitted || isEditMode} 
          className={`px-6 py-3 text-sm font-medium rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${feedbackSubmitted 
              ? 'bg-green-500 text-white cursor-not-allowed flex items-center justify-center'
              : isEditMode
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 transform hover:scale-105 active:scale-95'
            }`}
          aria-label={feedbackSubmitted ? "Cảm ơn bạn đã đánh giá!" : "Để lại đánh giá và phản hồi"}
        >
          {feedbackSubmitted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Cảm ơn bạn đã đánh giá!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                 <path fillRule="evenodd" d="M5 5.5A2.5 2.5 0 0 1 7.5 3h5A2.5 2.5 0 0 1 15 5.5v5.25a.75.75 0 0 0 1.5 0V5.5A4 4 0 0 0 12.5 1.5h-5A4 4 0 0 0 3.5 5.5v9A4 4 0 0 0 7.5 18.5h3.25a.75.75 0 0 0 0-1.5H7.5a2.5 2.5 0 0 1-2.5-2.5v-9Z" clipRule="evenodd" />
                 <path fillRule="evenodd" d="M15.22 11.22a.75.75 0 0 1-.06.06l-2.75 2.75a.75.75 0 1 1-1.06-1.06L13.31 11H9.75a.75.75 0 0 1 0-1.5h3.56l-1.94-1.94a.75.75 0 1 1 1.06-1.06l2.75 2.75a.75.75 0 0 1 .06.94Zm-1.56 2.56-.22.22a.75.75 0 0 1-1.06 0l-2.75-2.75a.75.75 0 0 1 1.06-1.06l2.22 2.22 2.22-2.22a.75.75 0 0 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-.82.22Z" clipRule="evenodd" />
              </svg>
              Để lại đánh giá
            </>
          )}
        </button>
      </div>

    </div>
  );
};
