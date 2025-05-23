
import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: Omit<ActivityItem, 'id'>) => void;
  modalTitle: string;
  initialData?: ActivityItem;
  currentDayNumber?: number;
  currentSectionTitle?: string;
}

const activityTypes: ActivityItem['type'][] = ['activity', 'food', 'transport', 'note', 'interaction'];
const defaultType = 'activity';

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  modalTitle,
  initialData,
  currentDayNumber,
  currentSectionTitle
}) => {
  const [type, setType] = useState<ActivityItem['type']>(defaultType);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [details, setDetails] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<string>(''); 
  const [currency, setCurrency] = useState('VND');
  const [formError, setFormError] = useState<string | null>(null);
  const [isModalContentVisible, setIsModalContentVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setDescription(initialData.description);
        setIcon(initialData.icon || '');
        setDetails(initialData.details || '');
        setEstimatedCost(initialData.estimatedCost?.toString() || '');
        setCurrency(initialData.currency || 'VND');
      } else {
        setType(defaultType);
        setDescription('');
        setIcon('');
        setDetails('');
        setEstimatedCost('');
        setCurrency('VND');
      }
      setFormError(null);
      const timer = setTimeout(() => setIsModalContentVisible(true), 10); 
      return () => clearTimeout(timer);
    } else {
      setIsModalContentVisible(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Mô tả hoạt động không được để trống.');
      return;
    }
    setFormError(null);

    const cost = estimatedCost ? parseFloat(estimatedCost) : undefined;
    if (estimatedCost && (isNaN(cost) || cost < 0)) {
        setFormError('Chi phí ước tính phải là một số không âm.');
        return;
    }
    
    onSubmit({
      type,
      description: description.trim(),
      icon: icon.trim() || undefined,
      details: details.trim() || undefined,
      estimatedCost: cost,
      currency: (cost !== undefined && currency.trim()) ? currency.trim().toUpperCase() : undefined,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm
                 transition-opacity duration-300 ease-in-out
                 ${isModalContentVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-activity-modal-title"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg
                   transform transition-all duration-300 ease-out
                   ${isModalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200">
          <div>
            <h2 id="add-activity-modal-title" className="text-lg sm:text-xl font-bold text-slate-800">
              {modalTitle}
            </h2>
            {currentDayNumber && currentSectionTitle && (
                <p className="text-xs text-slate-500 mt-0.5">
                    Vào Ngày {currentDayNumber} - Mục: {currentSectionTitle}
                </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 space-y-5">
            <div>
              <label htmlFor="activity-type" className="block text-sm font-medium text-slate-700 mb-1.5">
                Loại hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                id="activity-type"
                value={type}
                onChange={(e) => setType(e.target.value as ActivityItem['type'])}
                className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              >
                {activityTypes.map(t => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)} 
                    {t === 'activity' && ' (Chung)'}
                    {t === 'food' && ' (Ăn uống)'}
                    {t === 'transport' && ' (Di chuyển)'}
                    {t === 'note' && ' (Ghi chú)'}
                    {t === 'interaction' && ' (Tương tác)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="activity-description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Tham quan Chùa Một Cột"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="activity-icon" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Biểu tượng (Emoji)
                    </label>
                    <input
                        type="text"
                        id="activity-icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="Ví dụ: 🏛️, 🍜, 🚶"
                        className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        maxLength={5} 
                    />
                </div>
                <div>
                    <label htmlFor="activity-cost" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Chi phí ước tính
                    </label>
                    <input
                        type="number"
                        id="activity-cost"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="Ví dụ: 50000"
                        min="0"
                        step="1000"
                        className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                </div>
            </div>
             <div>
                <label htmlFor="activity-currency" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Đơn vị tiền tệ (cho chi phí)
                </label>
                <input
                    type="text"
                    id="activity-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="VND"
                    className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    maxLength={3}
                />
            </div>


            <div>
              <label htmlFor="activity-details" className="block text-sm font-medium text-slate-700 mb-1.5">
                Chi tiết thêm (Không bắt buộc)
              </label>
              <textarea
                id="activity-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Mua vé tại cổng, mở cửa từ 8h-17h"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{formError}</p>
            )}
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row-reverse sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
            >
             {initialData ? 'Lưu Thay đổi' : 'Thêm Hoạt động'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
