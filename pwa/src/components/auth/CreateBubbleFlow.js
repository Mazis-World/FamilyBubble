import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Circle, ShieldCheck, Star } from 'lucide-react';

const CreateBubbleFlow = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [bubbleName, setBubbleName] = useState('');
  const [userName, setUserName] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleComplete = () => {
    onComplete({ bubbleName, userName });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step
            title="Name Your Bubble"
            subtitle="This will be the name of your shared family space."
            onNext={nextStep}
            onBack={onBack}
            canGoNext={bubbleName.trim() !== ''}
          >
            <input
              type="text"
              placeholder="e.g., The Miller Family"
              value={bubbleName}
              onChange={(e) => setBubbleName(e.target.value)}
              className="w-full text-center font-bold text-2xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </Step>
        );
      case 2:
        return (
          <Step
            title="What's Your Name?"
            subtitle="This is how you'll appear to others in the bubble."
            onNext={nextStep}
            onBack={prevStep}
            canGoNext={userName.trim() !== ''}
          >
            <input
              type="text"
              placeholder="e.g., John"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-center font-bold text-2xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </Step>
        );
      case 3:
        return (
          <PaywallStep
            onSubscribe={handleComplete}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-blue-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      {renderStep()}
    </div>
  );
};

const Step = ({ title, subtitle, onNext, onBack, canGoNext, children }) => (
  <div className="max-w-md w-full z-10">
    <button
      onClick={onBack}
      className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
    >
      <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <div className="space-y-6">
        {children}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  </div>
);

const PaywallStep = ({ onSubscribe, onBack }) => (
  <div className="max-w-md w-full z-10">
    <button
      onClick={onBack}
      className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
    >
      <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <Star size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Unlock Premium</h1>
        <p className="text-gray-400">Choose a plan to create your bubble and get started.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-purple-600/20 border-2 border-purple-500 rounded-xl p-5 text-left flex items-center">
          <div>
            <h3 className="font-bold text-xl">Family Plan</h3>
            <p className="text-3xl font-bold">$9.99<span className="text-base font-normal text-gray-400">/month</span></p>
            <ul className="text-sm text-purple-200 mt-2 space-y-1">
              <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Up to 10 members</li>
              <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Unlimited Status Updates</li>
              <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Priority Support</li>
            </ul>
          </div>
          <div className="ml-auto">
            <Circle size={24} className="text-purple-400" />
          </div>
        </div>

        <button
          onClick={onSubscribe}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all transform hover:scale-105"
        >
          Subscribe & Create Bubble
        </button>
      </div>
    </div>
  </div>
);


export default CreateBubbleFlow;
