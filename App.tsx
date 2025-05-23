import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PlannerForm } from './components/PlannerForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LoadingIcon } from './components/LoadingIcon';
import { ErrorAlert } from './components/ErrorAlert';
import { PlanHistoryModal } from './components/PlanHistoryModal';
import { generateItinerary } from './services/geminiService';
import { PlanRequest, ItineraryData, StoredPlan } from './types';

const GLOBAL_HISTORY_KEY = 'vietnamPlannerHistory_global';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiApiKeyMissing, setIsGeminiApiKeyMissing] = useState<boolean>(false);
  const [isGoogleMapsApiKeyMissing, setIsGoogleMapsApiKeyMissing] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra Gemini API Key
    if (!process.env.API_KEY) {
      setIsGeminiApiKeyMissing(true);
      console.error("Gemini API Key không được cấu hình. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY.");
    } else {
      setIsGeminiApiKeyMissing(false);
    }
    
    // Kiểm tra Google Maps API Key
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      setIsGoogleMapsApiKeyMissing(true);
      console.error("Google Maps API Key không được cấu hình. Vui lòng kiểm tra biến môi trường GOOGLE_MAPS_API_KEY.");
    } else {
      setIsGoogleMapsApiKeyMissing(false);
    }
  }, []);

  const getStoredPlans = useCallback((): StoredPlan[] => {
    try {
      const storedData = localStorage.getItem(GLOBAL_HISTORY_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
      console.error("Error reading plan history from localStorage:", e);
      localStorage.removeItem(GLOBAL_HISTORY_KEY); // Clear corrupted data
      return [];
    }
  }, []);

  const savePlanToHistory = useCallback((planData: ItineraryData) => {
    const currentPlans = getStoredPlans();
    const newPlan: StoredPlan = {
      id: new Date().toISOString() + "_" + Math.random().toString(36).substring(2, 9),
      // userId is removed
      name: planData.title || "Kế hoạch không tên",
      createdAt: new Date().toISOString(),
      itineraryData: planData,
    };
    const updatedPlans = [newPlan, ...currentPlans].slice(0, 20); // Keep up to 20 plans
    localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(updatedPlans));
  }, [getStoredPlans]);


  const handlePlanRequest = useCallback(async (request: PlanRequest) => {
    if (isGeminiApiKeyMissing) {
      setError('Lỗi Cấu Hình: API Key của Gemini chưa được thiết lập. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY.');
      setIsLoadingPlan(false);
      return;
    }

    setIsLoadingPlan(true);
    setError(null);
    setItinerary(null);

    try {
      const result: ItineraryData = await generateItinerary(request);
      setItinerary(result);
      savePlanToHistory(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(`Đã xảy ra lỗi khi tạo lịch trình: ${err.message}`);
      } else {
        setError('Đã xảy ra lỗi không xác định khi tạo lịch trình.');
      }
    } finally {
      setIsLoadingPlan(false);
    }
  }, [isGeminiApiKeyMissing, savePlanToHistory]);

  const loadPlanFromHistory = (plan: ItineraryData) => {
    setItinerary(plan);
    setError(null);
    setShowHistoryModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePlanFromHistory = (planId: string) => {
    const currentPlans = getStoredPlans();
    const updatedPlans = currentPlans.filter(plan => plan.id !== planId);
    localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(updatedPlans));
    // If the deleted plan was the currently displayed one, clear it
    if (itinerary && itinerary.title === currentPlans.find(p => p.id === planId)?.name) { // A bit fragile if title is not unique, but good enough for now
        const currentLoadedPlan = currentPlans.find(p => p.id === planId);
        if (currentLoadedPlan && itinerary === currentLoadedPlan.itineraryData) {
            setItinerary(null);
        }
    }
  };

  // Kiểm tra xem Google Maps API đã được tải thành công chưa
  const [isGoogleMapsScriptLoaded, setIsGoogleMapsScriptLoaded] = useState(false);
  
  useEffect(() => {
    // Hàm kiểm tra Google Maps API đã tải xong chưa
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsScriptLoaded(true);
        return true;
      }
      return false;
    };

    // Nếu Google Maps API đã tải, đánh dấu là đã sẵn sàng
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Nếu chưa tải, thiết lập một interval để kiểm tra
    const intervalId = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        clearInterval(intervalId);
      }
    }, 500);

    // Thiết lập timeout sau 10 giây để tránh kiểm tra vô hạn
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!isGoogleMapsScriptLoaded) {
        console.warn("Google Maps API không tải được sau 10 giây. Tính năng bản đồ có thể không hoạt động.");
      }
    }, 10000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);


  if (isGeminiApiKeyMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-pink-700 flex flex-col items-center justify-center p-4 selection:bg-red-300 selection:text-red-900">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500 mx-auto mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Lỗi Cấu Hình API Key (Gemini)</h1>
          <p className="text-slate-600 mb-6">
            Rất tiếc, ứng dụng không thể hoạt động vì API Key của Gemini chưa được cấu hình.
            Vui lòng thiết lập biến môi trường <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono text-sm">GEMINI_API_KEY</code>.
          </p>
          <p className="text-xs text-slate-500">Nếu bạn là nhà phát triển, hãy kiểm tra tài liệu hướng dẫn.</p>
        </div>
         <footer className="w-full text-center p-5 text-sm text-white/70 mt-8">
            <p>&copy; {new Date().getFullYear()} Vietnam Travel Planner AI.</p>
        </footer>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex flex-col items-center selection:bg-teal-300 selection:text-teal-900">
        <Header onShowHistory={() => setShowHistoryModal(true)} />
        <main className="w-full max-w-4xl p-4 sm:p-6 md:p-8 flex-grow" role="main">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            <PlannerForm onSubmit={handlePlanRequest} isLoading={isLoadingPlan} />

            {isLoadingPlan && (
              <div className="mt-10 flex flex-col items-center justify-center text-slate-700" aria-live="assertive">
                <LoadingIcon className="w-12 h-12 text-teal-600" />
                <p className="mt-4 text-lg font-medium">AI đang Lập kế hoạch cho chuyến đi của bạn...</p>
                <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát.</p>
              </div>
            )}
            {error && !isLoadingPlan && (
              <div className="mt-8">
                <ErrorAlert message={error} />
              </div>
            )}
            {itinerary && !isLoadingPlan && !error && (
              <ItineraryDisplay itineraryData={itinerary} googleMapsApiAvailable={isGoogleMapsScriptLoaded} />
            )}
            {!itinerary && !isLoadingPlan && !error && (
              <div className="mt-10 text-center text-slate-600 p-6 py-10 border-2 border-dashed border-slate-300/80 rounded-lg bg-slate-50/50">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-20 h-20 text-teal-500 opacity-70 mx-auto mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-6.734 1.866-1.867a.75.75 0 1 1 1.06 1.06l-1.867 1.867m-4.243 4.242-1.867 1.867a.75.75 0 1 1-1.06-1.06l1.867-1.867m5.303-1.061.933.933a4.5 4.5 0 0 1-6.364 6.364l-.933-.933a4.5 4.5 0 0 1 6.364-6.364Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Lên Kế Hoạch Cho Chuyến Đi Mơ Ước Của Bạn!</h3>
                <p className="mt-2 text-sm max-w-md mx-auto text-slate-500">
                  Hãy cung cấp một vài thông tin, AI của chúng tôi sẽ tạo nên một lịch trình khám phá Việt Nam tuyệt vời và được cá nhân hóa cho riêng bạn.
                </p>
              </div>
            )}
            
            {isGoogleMapsApiKeyMissing && (
              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-700">
                  <strong>Lưu ý:</strong> Tính năng bản đồ đang bị vô hiệu hóa do thiếu Google Maps API Key. 
                  Vui lòng cấu hình biến môi trường <code className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-mono text-xs">GOOGLE_MAPS_API_KEY</code>.
                </p>
              </div>
            )}
          </div>
        </main>
        <footer className="w-full text-center p-5 text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Vietnam Travel Planner AI. Hỗ trợ bởi Gemini.</p>
        </footer>
      </div>
      {showHistoryModal && (
        <PlanHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onLoadPlan={loadPlanFromHistory}
          onDeletePlan={deletePlanFromHistory}
          getStoredPlans={getStoredPlans}
        />
      )}
    </>
  );
};

export default App;