import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const PurchaseSuccessView = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-blue-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
          <CheckCircle2 size={64} className="mx-auto text-emerald-400 mb-6" />
          <h1 className="text-4xl font-bold mb-2">Purchase Successful!</h1>
          <p className="text-gray-400 mb-8">
            Welcome to FamilyBubble Premium. Let's finish creating your bubble.
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/30 transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessView;
