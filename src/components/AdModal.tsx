import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { Advertisement } from '../utils/api';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adData: Advertisement;
  onComplete: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, adData, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(adData.display_seconds);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(adData.display_seconds);
    setCanClose(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, adData.display_seconds]);

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleCtaClick = () => {
    // Open the CTA link in a new tab
    window.open(adData.cta_url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full relative overflow-hidden">
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}

        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4 text-blue-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {timeLeft > 0 ? `${timeLeft}s remaining` : 'Ad complete!'}
            </span>
          </div>

          <img
            src={adData.image_url}
            alt="Advertisement"
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Advertisement';
            }}
          />

          <h3 className="text-xl font-bold text-gray-900 mb-4">{adData.headline}</h3>

          <button
            onClick={handleCtaClick}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4 w-full"
          >
            {adData.cta_text}
          </button>

          {canClose && (
            <button
              onClick={handleComplete}
              className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue to Results
            </button>
          )}

          {!canClose && (
            <p className="text-sm text-gray-500 mt-2">
              Please wait {timeLeft} seconds to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdModal;