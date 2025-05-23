
import React, { useState, useEffect } from 'react';
import { FeedbackData } from '../types';
import { LoadingIcon } from './LoadingIcon'; // Re-using for potential future async operations

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Omit<FeedbackData, 'itineraryTitle' | 'timestamp'>) => void;
  itineraryTitle: string;
}

const MAX_STARS = 5;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  itineraryTitle,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isModalContentVisible, setIsModalContentVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null); // New state for validation error

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false); // Reset submission state when modal reopens
      setRating(0);
      setComments('');
      setValidationError(null); // Reset validation error
      const timer = setTimeout(() => setIsModalContentVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsModalContentVisible(false);
    }
  }, [isOpen]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    if (validationError) {
      setValidationError(null); // Clear error when a star is selected
    }
  };

  const handleStarHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setValidationError("Vui lòng chọn số sao đánh giá."); // Set inline validation error
      return;
    }
    setValidationError(null); // Clear error if validation passes
    onSubmit({ rating, comments });
    setSubmitted(true); // Show thank you message
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
      aria-labelledby="feedback-modal-title"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg p-0
                   transform transition-all duration-300 ease-out
                   ${isModalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200">
          <h2 id="feedback-modal-title" className="text-lg sm:text-xl font-bold text-slate-800">
            {submitted ? "Cảm ơn bạn!" : `Đánh giá Lịch trình: ${itineraryTitle}`}
          </h2>
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

        {submitted ? (
          <div className="p-6 sm:p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-teal-500 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-slate-700 text-lg mb-2">Cảm ơn bạn đã gửi đánh giá!</p>
            <p className="text-sm text-slate-500 mb-6">Phản hồi của bạn rất quan trọng để chúng tôi cải thiện dịch vụ.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Đánh giá của bạn (bắt buộc):
                </label>
                <div className="flex items-center space-x-1" onMouseLeave={() => handleStarHover(0)}>
                  {[...Array(MAX_STARS)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={starValue}
                        onClick={() => handleStarClick(starValue)}
                        onMouseEnter={() => handleStarHover(starValue)}
                        className="focus:outline-none"
                        aria-label={`Rate ${starValue} out of ${MAX_STARS} stars`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className={`w-7 h-7 sm:w-8 sm:h-8 cursor-pointer transition-colors
                            ${(hoverRating || rating) >= starValue ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-slate-300 hover:text-yellow-300'}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.82.61l-4.725-2.885a.562.562 0 0 0-.652 0l-4.725 2.885a.562.562 0 0 1-.82-.61l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                {validationError && (
                  <p className="text-xs text-red-600 mt-1.5">{validationError}</p>
                )}
              </div>
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ý kiến của bạn (không bắt buộc):
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn hoặc những điều AI có thể cải thiện..."
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150"
                />
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row-reverse sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
              >
                Gửi Đánh Giá
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
        )}
      </div>
    </div>
  );
};
