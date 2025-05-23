
import React, { useState, useEffect, useCallback } from 'react';
import { ItineraryData, StoredPlan } from '../types';
import { LoadingIcon } from './LoadingIcon';

interface PlanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (plan: ItineraryData) => void;
  onDeletePlan: (planId: string) => void;
  getStoredPlans: () => StoredPlan[]; // Now fetches global plans
}

export const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadPlan,
  onDeletePlan,
  getStoredPlans
}) => {
  const [plans, setPlans] = useState<StoredPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalContentVisible, setIsModalContentVisible] = useState(false);

  const fetchPlans = useCallback(() => {
    setIsLoading(true);
    try {
      const globalPlans = getStoredPlans();
      setPlans(globalPlans);
    } catch (e) {
      console.error("Error fetching plans for modal:", e);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredPlans]);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      const timer = setTimeout(() => setIsModalContentVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsModalContentVisible(false);
    }
  }, [isOpen, fetchPlans]);

  if (!isOpen) {
    return null;
  }

  const handleDelete = (planId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này khỏi lịch sử không?")) {
      onDeletePlan(planId);
      fetchPlans(); // Refresh the list after deletion
    }
  };
  
  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return "Ngày không hợp lệ";
    }
  };


  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm
                 transition-opacity duration-300 ease-in-out
                 ${isModalContentVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-history-title"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0
                   transform transition-all duration-300 ease-out
                   ${isModalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 id="plan-history-title" className="text-xl font-bold text-slate-800">
            Lịch sử Kế hoạch
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Đóng lịch sử"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingIcon className="w-8 h-8 text-teal-600" />
              <p className="ml-3 text-slate-600">Đang tải lịch sử...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-16 h-16 text-slate-400 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.393-.033.796-.033 1.176 0a2.25 2.25 0 0 1 1.976 2.192V7.5M12 18.75v-5.25c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V18.75M12 18.75a2.25 2.25 0 0 0 2.25 2.25h.865a2.25 2.25 0 0 0 2.007-1.432L19.5 12.75h-15l2.385 7.568A2.25 2.25 0 0 0 8.865 21h.865a2.25 2.25 0 0 0 2.25-2.25Z" />
              </svg>
              <p className="text-slate-500 text-center">Bạn chưa có kế hoạch nào được lưu.</p>
              <p className="text-xs text-slate-400 mt-1">Hãy tạo một chuyến đi mới!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {plans.map((plan) => (
                <li key={plan.id} className="p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h3 className="text-md font-semibold text-teal-700 mb-0.5">{plan.name}</h3>
                      <p className="text-xs text-slate-500">
                        Tạo lúc: {formatDateTime(plan.createdAt)}
                      </p>
                       <p className="text-xs text-slate-500 mt-0.5">
                        {plan.itineraryData.days.length} ngày - {plan.itineraryData.overview?.substring(0,50) || 'Không có mô tả'}...
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 items-center sm:items-end">
                       <button
                        onClick={() => onLoadPlan(plan.itineraryData)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
            <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};