import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Circle, ShieldCheck, Star, Plus, ChevronDown } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { Purchases } from '@revenuecat/purchases-js';
import { auth } from '../../firebase';

const CreateBubbleFlow = ({ onComplete, onBack, isPremium }) => {
  const [step, setStep] = useState(1);
  const [bubbleName, setBubbleName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userPhoto, setUserPhoto] = useState(null); // URL or base64
  const [relationshipRole, setRelationshipRole] = useState('');

  const [offerings, setOfferings] = useState(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [offeringsError, setOfferingsError] = useState(null);



  // Fetch offerings when the paywall step is reached and RevenueCat is configured
  useEffect(() => {
    if (step === 6 && Purchases.isConfigured) {
      const fetchOfferings = async () => {
        setLoadingOfferings(true);
        setOfferingsError(null);
        try {
          const offerings = await Purchases.getOfferings();
          setOfferings(offerings.current); // Assuming we want the current offering set
          console.log("RevenueCat Offerings fetched:", offerings);
        } catch (e) {
          console.error("Error fetching RevenueCat offerings:", e);
          setOfferingsError("Failed to load subscription options. Please try again.");
        } finally {
          setLoadingOfferings(false);
        }
      };
      fetchOfferings();
    }
  }, [step]);


  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handlePurchase = async (packageToPurchase) => {
    try {
      // purchasePackage returns the customerInfo and a boolean indicating if it was a real purchase
      const { customerInfo, product, presentedOfferingIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      if (customerInfo.entitlements.active.premium) { // Assuming 'premium' is the entitlement ID
        console.log("Purchase successful! User is now premium.");
        onComplete(); // Only call onComplete after a successful purchase
      } else {
        console.log("Purchase made, but premium entitlement not active.");
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.error("Error purchasing package:", e);
        // TODO: Show error message to user
      } else {
        console.log("Purchase cancelled by user.");
      }
    }
  };

  const relationshipOptions = [
    { value: '', label: 'Select your role', disabled: true }, // Placeholder option
    { value: 'Mom', label: 'Mom' },
    { value: 'Dad', label: 'Dad' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Sister', label: 'Sister' },
    { value: 'Guardian', label: 'Guardian' },
    { value: 'Custom', label: 'Custom' },
  ];

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
            canGoNext={firstName.trim() !== '' && lastName.trim() !== ''}
          >
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 text-center font-bold text-xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 text-center font-bold text-xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </Step>
        );
      case 3:
        return (
          <Step
            title="Add Your Photo"
            subtitle="This will be visible to members in your bubble."
            onNext={nextStep}
            onBack={prevStep}
            canGoNext={userPhoto !== null}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="user-photo-upload"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const size = Math.min(img.width, img.height);
                      canvas.width = size;
                      canvas.height = size;
                      const ctx = canvas.getContext('2d');
                      
                      ctx.beginPath();
                      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                      ctx.closePath();
                      ctx.clip();
                      
                      const x = (img.width - size) / 2;
                      const y = (img.height - size) / 2;
                      ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
                      setUserPhoto(canvas.toDataURL('image/png')); // Store as Data URL
                    };
                    img.src = event.target.result;
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label
              htmlFor="user-photo-upload"
              className="relative w-32 h-32 rounded-full cursor-pointer overflow-hidden flex items-center justify-center mx-auto bg-gray-800 border-2 border-gray-700 hover:border-purple-500 transition-colors group"
            >
              {userPhoto ? (
                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
              ) : (
                <Plus size={48} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
              )}
              {userPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-semibold">Change Photo</span>
                </div>
              )}
            </label>
          </Step>
        );
      case 4:
        return (
          <Step
            title="Your Role in the Bubble"
            subtitle="This helps personalize the bubble later."
            onNext={nextStep}
            onBack={prevStep}
            canGoNext={relationshipRole.trim() !== ''}
          >
            <CustomSelect
              options={relationshipOptions}
              value={relationshipRole}
              onChange={setRelationshipRole}
              placeholder="Select your role"
              className="w-full"
            />
            {relationshipRole === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom role"
                className="w-full text-center font-bold text-xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mt-4"
                onChange={(e) => setRelationshipRole(e.target.value)}
              />
            )}
          </Step>
        );
      case 5:
        return (
          <Step
            title="Ready to Create Your Bubble!"
            subtitle="Here's a summary of your new bubble."
            onNext={isPremium ? onComplete : nextStep} // If premium, complete; otherwise, go to next step (paywall)
            onBack={prevStep}
            canGoNext={true}
          >
            <div className="text-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto relative overflow-hidden">
                {userPhoto ? (
                  <img src={userPhoto} alt="User" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Circle size={48} className="text-white" />
                )}
                {/* Mock status icon */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
                  <ChevronRight size={16} className="text-white transform rotate-45" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{bubbleName}</h2>
              <p className="text-gray-300">Welcome, {firstName} {lastName} ({relationshipRole})!</p>
              <p className="text-sm text-gray-500">
                You're almost there! One final step to launch your personalized family bubble.
              </p>
            </div>
          </Step>
        );
      case 6:
        return (
          <PaywallStep
            onPurchasePackage={handlePurchase}
            onBack={prevStep}
            offerings={offerings}
            loadingOfferings={loadingOfferings}
            offeringsError={offeringsError}
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

const PaywallStep = ({ onPurchasePackage, onBack, offerings, loadingOfferings, offeringsError }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  useEffect(() => {
    if (offerings && offerings.availablePackages.length > 0) {
      // Automatically select the first package if available
      setSelectedPackage(offerings.availablePackages[0]);
    }
  }, [offerings]);

  const handleSubscribeClick = async () => {
    if (selectedPackage) {
      setLoadingPurchase(true);
      setPurchaseError(null);
      try {
        await onPurchasePackage(selectedPackage);
      } catch (e) {
        setPurchaseError("Purchase failed. Please try again.");
      } finally {
        setLoadingPurchase(false);
      }
    }
  };

  if (loadingOfferings) {
    return (
      <div className="max-w-md w-full z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg text-center">
          <h1 className="text-4xl font-bold mb-2">Loading Plans...</h1>
          <p className="text-gray-400">Please wait while we fetch subscription options.</p>
        </div>
      </div>
    );
  }

  if (offeringsError) {
    return (
      <div className="max-w-md w-full z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg text-center">
          <h1 className="text-4xl font-bold mb-2">Error</h1>
          <p className="text-red-400">{offeringsError}</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Assuming `offerings.current` exists and contains `availablePackages`
  const packages = offerings && offerings.availablePackages ? offerings.availablePackages : [];

  return (
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
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <div
                key={pkg.identifier}
                className={`bg-purple-600/20 border-2 rounded-xl p-5 text-left flex items-center cursor-pointer transition-all ${
                  selectedPackage?.identifier === pkg.identifier
                    ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                    : 'border-gray-700 hover:border-purple-500'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div>
                  <h3 className="font-bold text-xl">{pkg.product.title}</h3>
                  <p className="text-3xl font-bold">{pkg.product.priceString}
                    <span className="text-base font-normal text-gray-400">
                      {pkg.product.period?.numberOfUnits && pkg.product.period?.unit ? `/${pkg.product.period.numberOfUnits} ${pkg.product.period.unit}` : ''}
                    </span>
                  </p>
                  <ul className="text-sm text-purple-200 mt-2 space-y-1">
                    {/* Placeholder for features, ideally from product description */}
                    <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Up to 10 members</li>
                    <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Unlimited Status Updates</li>
                    <li className="flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-400" /> Priority Support</li>
                  </ul>
                </div>
                <div className="ml-auto">
                  <Circle size={24} className={selectedPackage?.identifier === pkg.identifier ? 'text-purple-400' : 'text-gray-600'} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No subscription offerings available.</div>
          )}

          {purchaseError && <p className="text-red-400 text-center mt-2">{purchaseError}</p>}

          <button
            onClick={handleSubscribeClick}
            disabled={!selectedPackage || loadingPurchase}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPurchase ? "Processing..." : "Subscribe & Create Bubble"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default CreateBubbleFlow;
