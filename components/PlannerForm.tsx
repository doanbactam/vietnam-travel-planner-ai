
import React, { useState, useEffect, useRef } from 'react';
import { PlanRequest } from '../types';
import { LoadingIcon } from './LoadingIcon';
import { vietnamProvinces } from '../data/vietnamProvinces';
import { suggestedInterests } from '../data/suggestedInterests'; // New import

interface PlannerFormProps {
  onSubmit: (request: PlanRequest) => void;
  isLoading: boolean;
}

const hotelPreferences: string[] = [
  "Bất kỳ", "Tiết kiệm (Nhà nghỉ, Hostel)", "Tầm trung (Khách sạn 2-3 sao)",
  "Cao cấp (Khách sạn 4-5 sao, Resort)", "Homestay/Boutique"
];

const tripPurposes: string[] = [
  "Không xác định", "Gia đình", "Cặp đôi", "Bạn bè", "Team Building", "Một mình", "Khám phá Văn hóa & Lịch sử", "Phiêu lưu & Thiên nhiên", "Nghỉ dưỡng & Thư giãn"
];

const presetDurations: number[] = [3, 5, 7, 10, 14];

const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [destinations, setDestinations] = useState<string>('');
  const [duration, setDuration] = useState<number>(7);
  const [interestsInput, setInterestsInput] = useState<string>(''); // New state for interests text input
  const [tripPurpose, setTripPurpose] = useState<string>(tripPurposes[0]); // New state for trip purpose
  const [departurePoint, setDeparturePoint] = useState<string>('');
  const [numberOfTravelers, setNumberOfTravelers] = useState<number>(1);
  const [hotelPreference, setHotelPreference] = useState<string>(hotelPreferences[0]);

  const [formError, setFormError] = useState<string | null>(null);

  // Destination Autocomplete
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState<boolean>(false);
  const [activeDestinationSuggestionIndex, setActiveDestinationSuggestionIndex] = useState<number>(-1);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Departure Point Autocomplete
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState<boolean>(false);
  const [activeDepartureSuggestionIndex, setActiveDepartureSuggestionIndex] = useState<number>(-1);
  const departureInputRef = useRef<HTMLInputElement>(null);

  // Interest Autocomplete
  const [interestSuggestions, setInterestSuggestions] = useState<string[]>([]);
  const [showInterestSuggestions, setShowInterestSuggestions] = useState<boolean>(false);
  const [activeInterestSuggestionIndex, setActiveInterestSuggestionIndex] = useState<number>(-1);
  const interestsInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = isLoading;

  const handleDurationPreset = (preset: number) => {
    setDuration(preset);
  };

  // Destination Autocomplete Logic
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinations(value);
    const parts = value.split(',');
    const currentSegment = parts[parts.length - 1].trimStart();
    if (currentSegment.length > 0) {
      const normalizedSegment = normalizeString(currentSegment);
      const filtered = vietnamProvinces.filter(province =>
        normalizeString(province).includes(normalizedSegment)
      );
      setDestinationSuggestions(filtered.slice(0, 7));
      setShowDestinationSuggestions(filtered.length > 0);
      setActiveDestinationSuggestionIndex(-1);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  const handleDestinationSuggestionClick = (suggestion: string) => {
    const parts = destinations.split(',');
    parts[parts.length - 1] = suggestion;
    let newDestinationsValue = parts.join(', ');
    if (newDestinationsValue.trim() !== '' && !newDestinationsValue.endsWith(', ')) {
        newDestinationsValue += ', ';
    }
    setDestinations(newDestinationsValue);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    setActiveDestinationSuggestionIndex(-1);
    destinationInputRef.current?.focus();
  };

  const handleDestinationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestinationSuggestions || destinationSuggestions.length === 0) return;
    // FIX: Add braces to if/else if blocks
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveDestinationSuggestionIndex(prev => (prev + 1) % destinationSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveDestinationSuggestionIndex(prev => (prev - 1 + destinationSuggestions.length) % destinationSuggestions.length);
    } else if (e.key === 'Enter' && activeDestinationSuggestionIndex >= 0) {
      e.preventDefault();
      handleDestinationSuggestionClick(destinationSuggestions[activeDestinationSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowDestinationSuggestions(false);
    }
  };
  const handleDestinationBlur = () => setTimeout(() => { setShowDestinationSuggestions(false); setActiveDestinationSuggestionIndex(-1); }, 150);
  const handleDestinationFocus = () => {
    if (isDisabled) return;
    const parts = destinations.split(',');
    const currentSegment = parts[parts.length - 1].trimStart();
    if (currentSegment.length > 0) {
      const normalizedSegment = normalizeString(currentSegment);
      const filtered = vietnamProvinces.filter(province => normalizeString(province).includes(normalizedSegment));
      if (filtered.length > 0) {
        setDestinationSuggestions(filtered.slice(0,7));
        setShowDestinationSuggestions(true);
      }
    }
  };

  // Departure Point Autocomplete Logic (similar to destination)
  const handleDeparturePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeparturePoint(value);
    if (value.trim().length > 0) {
      const normalizedValue = normalizeString(value.trim());
      const filtered = vietnamProvinces.filter(province =>
        normalizeString(province).includes(normalizedValue)
      );
      setDepartureSuggestions(filtered.slice(0, 5));
      setShowDepartureSuggestions(filtered.length > 0);
      setActiveDepartureSuggestionIndex(-1);
    } else {
      setDepartureSuggestions([]);
      setShowDepartureSuggestions(false);
    }
  };
  const handleDepartureSuggestionClick = (suggestion: string) => {
    setDeparturePoint(suggestion);
    setDepartureSuggestions([]);
    setShowDepartureSuggestions(false);
    setActiveDepartureSuggestionIndex(-1);
    departureInputRef.current?.focus();
  };
  const handleDepartureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDepartureSuggestions || departureSuggestions.length === 0) return;
    // FIX: Add braces to if/else if blocks
    if (e.key === 'ArrowDown') {
        e.preventDefault(); 
        setActiveDepartureSuggestionIndex(prev => (prev + 1) % departureSuggestions.length);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); 
        setActiveDepartureSuggestionIndex(prev => (prev - 1 + departureSuggestions.length) % departureSuggestions.length);
    } else if (e.key === 'Enter' && activeDepartureSuggestionIndex >= 0) {
        e.preventDefault(); 
        handleDepartureSuggestionClick(departureSuggestions[activeDepartureSuggestionIndex]);
    } else if (e.key === 'Escape') {
        setShowDepartureSuggestions(false);
    }
  };
  const handleDepartureBlur = () => setTimeout(() => { setShowDepartureSuggestions(false); setActiveDepartureSuggestionIndex(-1);}, 150);
  const handleDepartureFocus = () => {
    if (isDisabled) return;
    if (departurePoint.trim().length > 0) {
       const normalizedValue = normalizeString(departurePoint.trim());
       const filtered = vietnamProvinces.filter(province => normalizeString(province).includes(normalizedValue));
       if (filtered.length > 0) {
        setDepartureSuggestions(filtered.slice(0,5));
        setShowDepartureSuggestions(true);
       }
    }
  };

  // Interests Autocomplete Logic
  const handleInterestsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInterestsInput(value);
    const parts = value.split(',');
    const currentSegment = parts[parts.length - 1].trimStart();

    if (currentSegment.length > 0) {
      const normalizedSegment = normalizeString(currentSegment);
      const filtered = suggestedInterests.filter(interest =>
        normalizeString(interest).includes(normalizedSegment) &&
        !parts.slice(0, -1).map(p => p.trim()).includes(interest) // Exclude already selected
      );
      setInterestSuggestions(filtered.slice(0, 7));
      setShowInterestSuggestions(filtered.length > 0);
      setActiveInterestSuggestionIndex(-1);
    } else {
      setInterestSuggestions([]);
      setShowInterestSuggestions(false);
    }
  };

  const handleInterestSuggestionClick = (suggestion: string) => {
    const parts = interestsInput.split(',').map(p => p.trim()).filter(p => p);
    if (!parts.includes(suggestion)) {
        // Replace current segment if it exists, otherwise add new
        if (parts.length > 0 && interestsInput.endsWith(parts[parts.length-1])) {
             parts[parts.length-1] = suggestion;
        } else {
            const currentInputValueParts = interestsInput.split(',');
            if (currentInputValueParts.length > 0 && currentInputValueParts[currentInputValueParts.length-1].trim() === "") {
                 // If the last part is empty (e.g. "Interest1, "), replace it
                 currentInputValueParts[currentInputValueParts.length-1] = suggestion;
                 parts.splice(0, parts.length, ...currentInputValueParts.map(p => p.trim()).filter(p=>p));
            } else if (!parts.includes(suggestion)) {
                 parts.push(suggestion);
            }
        }
    }
    
    let newInterestsValue = parts.join(', ');
    if (newInterestsValue.trim() !== '' && !newInterestsValue.endsWith(', ')) {
        newInterestsValue += ', ';
    }

    setInterestsInput(newInterestsValue);
    setInterestSuggestions([]);
    setShowInterestSuggestions(false);
    setActiveInterestSuggestionIndex(-1);
    interestsInputRef.current?.focus();
  };

  const handleInterestsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showInterestSuggestions || interestSuggestions.length === 0) return;
    // FIX: Add braces to if/else if blocks
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveInterestSuggestionIndex(prev => (prev + 1) % interestSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveInterestSuggestionIndex(prev => (prev - 1 + interestSuggestions.length) % interestSuggestions.length);
    } else if (e.key === 'Enter' && activeInterestSuggestionIndex >= 0) {
      e.preventDefault();
      handleInterestSuggestionClick(interestSuggestions[activeInterestSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowInterestSuggestions(false);
    }
  };

  const handleInterestsBlur = () => setTimeout(() => { setShowInterestSuggestions(false); setActiveInterestSuggestionIndex(-1); }, 150);
  
  const handleInterestsFocus = () => {
    if (isDisabled) return;
    const parts = interestsInput.split(',');
    const currentSegment = parts[parts.length - 1].trimStart();
    if (currentSegment.length > 0) {
      const normalizedSegment = normalizeString(currentSegment);
      const filtered = suggestedInterests.filter(interest =>
        normalizeString(interest).includes(normalizedSegment) &&
        !parts.slice(0, -1).map(p => p.trim()).includes(interest)
      );
      if (filtered.length > 0) {
        setInterestSuggestions(filtered.slice(0,7));
        setShowInterestSuggestions(true);
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDestinationSuggestions(false);
    setShowDepartureSuggestions(false);
    setShowInterestSuggestions(false);

    const cleanedDestinations = destinations
      .split(',')
      .map(d => d.trim())
      .filter(d => d !== '')
      .join(', ');

    const cleanedInterests = interestsInput
      .split(',')
      .map(i => i.trim())
      .filter(i => i !== '')
      .join(', ');

    if (!cleanedDestinations) {
        setFormError('Vui lòng nhập ít nhất một điểm đến hợp lệ.');
        return;
    }
    if (duration <= 0) {
        setFormError('Thời gian chuyến đi phải là số dương.');
        return;
    }
     if (numberOfTravelers <= 0) {
        setFormError('Số lượng người đi phải là số dương.');
        return;
    }
    setFormError(null);
    onSubmit({
      destinations: cleanedDestinations,
      // FIX: Explicitly assign properties from state
      duration: duration,
      interests: cleanedInterests,
      departurePoint: departurePoint.trim(),
      // FIX: Explicitly assign properties from state
      numberOfTravelers: numberOfTravelers,
      // FIX: Explicitly assign properties from state
      hotelPreference: hotelPreference,
      tripPurpose: tripPurpose === "Không xác định" ? undefined : tripPurpose,
    });
  };

  useEffect(() => {
    if (activeDestinationSuggestionIndex >= 0 && activeDestinationSuggestionIndex < destinationSuggestions.length) {
        document.getElementById(`destination-suggestion-${activeDestinationSuggestionIndex}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeDestinationSuggestionIndex, destinationSuggestions]);

  useEffect(() => {
    if (activeDepartureSuggestionIndex >= 0 && activeDepartureSuggestionIndex < departureSuggestions.length) {
        document.getElementById(`departure-suggestion-${activeDepartureSuggestionIndex}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeDepartureSuggestionIndex, departureSuggestions]);

   useEffect(() => {
    if (activeInterestSuggestionIndex >= 0 && activeInterestSuggestionIndex < interestSuggestions.length) {
        document.getElementById(`interest-suggestion-${activeInterestSuggestionIndex}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeInterestSuggestionIndex, interestSuggestions]);


  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Departure Point */}
      <div className="relative">
        <label htmlFor="departurePoint" className="block text-sm font-medium text-slate-700 mb-1.5">
          Điểm khởi hành (Tỉnh/Thành phố)
        </label>
        <input
          ref={departureInputRef}
          type="text"
          id="departurePoint"
          value={departurePoint}
          onChange={handleDeparturePointChange}
          onKeyDown={handleDepartureKeyDown}
          onBlur={handleDepartureBlur}
          onFocus={handleDepartureFocus}
          placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội..."
          className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 disabled:bg-slate-100 disabled:text-slate-500"
          disabled={isDisabled}
          autoComplete="off"
        />
        {showDepartureSuggestions && departureSuggestions.length > 0 && !isDisabled && (
          <ul className="absolute z-30 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100" role="listbox">
            {departureSuggestions.map((suggestion, index) => (
              <li
                key={`departure-${suggestion}-${index}`}
                id={`departure-suggestion-${index}`}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  index === activeDepartureSuggestionIndex ? 'bg-teal-100 text-teal-700 font-medium' : 'text-slate-700 hover:bg-teal-50'
                }`}
                onMouseDown={() => handleDepartureSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === activeDepartureSuggestionIndex}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
         <p className="mt-2 text-xs text-slate-500">
          Nhập tỉnh/thành phố bạn bắt đầu chuyến đi (nếu có).
        </p>
      </div>

      {/* Destinations */}
      <div className="relative">
        <label htmlFor="destinations" className="block text-sm font-medium text-slate-700 mb-1.5">
          Điểm đến của bạn (cách nhau bởi dấu phẩy)
        </label>
        <input
          ref={destinationInputRef}
          type="text"
          id="destinations"
          value={destinations}
          onChange={handleDestinationChange}
          onKeyDown={handleDestinationKeyDown}
          onBlur={handleDestinationBlur}
          onFocus={handleDestinationFocus}
          placeholder="Ví dụ: Hà Nội, Đà Nẵng, Sapa, Phú Quốc..."
          className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 disabled:bg-slate-100 disabled:text-slate-500"
          disabled={isDisabled}
          aria-describedby="destinations-description"
          autoComplete="off"
        />
        {showDestinationSuggestions && destinationSuggestions.length > 0 && !isDisabled && (
          <ul
            className="absolute z-20 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
            role="listbox"
            aria-labelledby="destinations"
          >
            {destinationSuggestions.map((suggestion, index) => (
              <li
                key={`destination-${suggestion}-${index}`}
                id={`destination-suggestion-${index}`}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  index === activeDestinationSuggestionIndex
                    ? 'bg-teal-100 text-teal-700 font-medium'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
                onMouseDown={() => handleDestinationSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === activeDestinationSuggestionIndex}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <p id="destinations-description" className="mt-2 text-xs text-slate-500">
          Nhập các tỉnh/thành phố bạn muốn khám phá. Gõ để xem gợi ý.
        </p>
      </div>
      
      {/* Interests */}
      <div className="relative">
        <label htmlFor="interests" className="block text-sm font-medium text-slate-700 mb-1.5">
          Sở thích (cách nhau bởi dấu phẩy)
        </label>
        <input
          ref={interestsInputRef}
          type="text"
          id="interests"
          value={interestsInput}
          onChange={handleInterestsInputChange}
          onKeyDown={handleInterestsKeyDown}
          onBlur={handleInterestsBlur}
          onFocus={handleInterestsFocus}
          placeholder="Ví dụ: Văn hóa, Ẩm thực, Phiêu lưu..."
          className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 disabled:bg-slate-100 disabled:text-slate-500"
          disabled={isDisabled}
          autoComplete="off"
        />
        {showInterestSuggestions && interestSuggestions.length > 0 && !isDisabled && (
          <ul
            className="absolute z-20 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
            role="listbox"
            aria-labelledby="interests"
          >
            {interestSuggestions.map((suggestion, index) => (
              <li
                key={`interest-${suggestion}-${index}`}
                id={`interest-suggestion-${index}`}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  index === activeInterestSuggestionIndex
                    ? 'bg-teal-100 text-teal-700 font-medium'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
                onMouseDown={() => handleInterestSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === activeInterestSuggestionIndex}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <p id="interests-description" className="mt-2 text-xs text-slate-500">
          Nhập các sở thích của bạn, hoặc chọn từ gợi ý.
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1.5">
            Thời gian chuyến đi (ngày)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
            min="1"
            className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 appearance-none disabled:bg-slate-100 disabled:text-slate-500"
            disabled={isDisabled}
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {presetDurations.map(d => (
              <button
                type="button"
                key={d}
                onClick={() => handleDurationPreset(d)}
                disabled={isDisabled}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  duration === d
                    ? 'bg-teal-600 text-white ring-2 ring-teal-500 ring-offset-1'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {d} ngày
              </button>
            ))}
          </div>
        </div>

        {/* Number of Travelers */}
        <div>
          <label htmlFor="numberOfTravelers" className="block text-sm font-medium text-slate-700 mb-1.5">
            Số lượng người đi
          </label>
          <input
            type="number"
            id="numberOfTravelers"
            value={numberOfTravelers}
            onChange={(e) => setNumberOfTravelers(parseInt(e.target.value, 10) || 1)}
            min="1"
            className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 appearance-none disabled:bg-slate-100 disabled:text-slate-500"
            disabled={isDisabled}
          />
           <p className="mt-2.5 text-xs text-slate-500">
            Để AI gợi ý phù hợp hơn cho nhóm của bạn.
          </p>
        </div>
      </div>

      {/* Trip Purpose */}
      <div>
        <label htmlFor="tripPurpose" className="block text-sm font-medium text-slate-700 mb-1.5">
          Mục đích chuyến đi
        </label>
        <select
          id="tripPurpose"
          value={tripPurpose}
          onChange={(e) => setTripPurpose(e.target.value)}
          disabled={isDisabled}
          className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 disabled:bg-slate-100 disabled:text-slate-500"
        >
          {tripPurposes.map(purpose => (
            <option key={purpose} value={purpose}>{purpose}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Giúp AI cá nhân hóa lịch trình tốt hơn.
        </p>
      </div>


      {/* Hotel Preference */}
      <div>
        <label htmlFor="hotelPreference" className="block text-sm font-medium text-slate-700 mb-1.5">
          Ưu tiên về khách sạn
        </label>
        <select
          id="hotelPreference"
          value={hotelPreference}
          onChange={(e) => setHotelPreference(e.target.value)}
          disabled={isDisabled}
          className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow duration-150 disabled:bg-slate-100 disabled:text-slate-500"
        >
          {hotelPreferences.map(pref => (
            <option key={pref} value={pref}>{pref}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          AI sẽ đưa ra gợi ý chung, không phải tên khách sạn cụ thể.
        </p>
      </div>

      {formError && (
        <div role="alert" className="rounded-md bg-red-50 p-3 mt-6">
          <p className="text-sm text-red-600">{formError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${isDisabled ? 'bg-slate-400 cursor-not-allowed hover:bg-slate-400' : 'hover:bg-teal-700'} transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95`}
        aria-label="Tạo Lịch Trình Du Lịch"
      >
        {isLoading ? (
          <>
            <LoadingIcon className="w-5 h-5 mr-3 -ml-1" />
            Đang kiến tạo chuyến đi...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2.5">
              <path d="M9.435 2.546a.75.75 0 0 1 .01 1.06l-4.251 4.251a.75.75 0 0 0-.215.491V12.5a.75.75 0 0 0 .75.75h4.153a.75.75 0 0 0 .491-.215l4.251-4.251a.75.75 0 0 1 1.06.01l.535.534a.75.75 0 0 1 0 1.06l-6.552 6.552a.75.75 0 0 1-1.06 0L1.715 9.215a.75.75 0 0 1 0-1.06l.535-.535a.75.75 0 0 1 1.06.01l2.03 2.03V3.296a.75.75 0 0 1 .996-.749l5.035.63a.75.75 0 0 1 .064 1.372L9.435 2.546Z" />
              <path d="M9.75 11.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
              <path d="M16 5.75a.75.75 0 0 0-.75-.75h-.035a.75.75 0 0 0-.714.75V8.5a.75.75 0 0 0 .75.75h.035a.75.75 0 0 0 .714-.75V5.75Z" />
              <path d="M14.25 7.5a.75.75 0 0 0-.75-.75h-.036a.75.75 0 0 0-.714.75v3.036A.75.75 0 0 0 13.5 11h.035a.75.75 0 0 0 .714-.75V7.5Z" />
              <path d="M18.5 9.25a.75.75 0 0 0-.75-.75h-.035a.75.75 0 0 0-.714.75v3.035a.75.75 0 0 0 .75.75h.035a.75.75 0 0 0 .714-.75V9.25Z" />
            </svg>
            Tạo Lịch Trình Mơ Ước
          </>
        )}
      </button>
    </form>
  );
};
