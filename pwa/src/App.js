import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import MainApp from './components/bubble/MainApp';
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login';
import JoinBubble from './components/auth/JoinBubble';
import CreateBubbleFlow from './components/auth/CreateBubbleFlow';
import { Purchases, LogLevel } from '@revenuecat/purchases-js';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function FamilyBubbleApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('welcome'); // welcome, login, join, create, main, purchaseSuccess, purchaseError
  const [joinToken, setJoinToken] = useState(null);
  const [bubbleCreationData, setBubbleCreationData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLapsedSubscriber, setIsLapsedSubscriber] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [anonymousId, setAnonymousId] = useState(null);

  useEffect(() => {
    const initializePurchases = async (user) => {
      Purchases.setLogLevel(LogLevel.DEBUG);

      await Purchases.configure({
        apiKey: "test_ZUBBwQojxkZCoVcCxjqjtUdSdzr",
        appUserId: user.uid,
      });

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        const premiumEntitlement = info.entitlements.active["FamilyBubble Premium"];
        if (typeof premiumEntitlement !== "undefined") {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      });

      const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active["FamilyBubble Premium"];
      const wasOnceSubscriber = customerInfo.entitlements.all["FamilyBubble Premium"];

      if (typeof premiumEntitlement !== "undefined") {
        setIsSubscribed(true);
      } else if (typeof wasOnceSubscriber !== "undefined") {
        setIsLapsedSubscriber(true);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async user => {
      setCurrentUser(user);
      setLoading(false);

      if (user && !user.isAnonymous) { // Don't run for the temporary anonymous user
        await initializePurchases(user);
        setView('main');
      } else if (user && user.isAnonymous) {
        // This case is handled by the login logic after account creation
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      Purchases.getSharedInstance().logOut();
      setIsSubscribed(false);
      setIsLapsedSubscriber(false);
      setView('welcome');
      setJoinToken(null);
      setBubbleCreationData(null);
    });
  };
  
  const handlePurchase = async (onSuccess) => {
    try {
      // Ensure Purchases is configured, especially for the anonymous user creation flow.
      if (!Purchases.isConfigured()) {
        console.log("Configuring Purchases for anonymous user...");
        const appUserId = Purchases.generateRevenueCatAnonymousAppUserId();
        setAnonymousId(appUserId); // Store anonymous ID for later
        await Purchases.configure({
          apiKey: "test_ZUBBwQojxkZCoVcCxjqjtUdSdzr",
          appUserId: appUserId,
        });
      }

      const purchases = Purchases.getSharedInstance();
      const offerings = await purchases.getOfferings();
      const currentOffering = offerings.current;
      if (!currentOffering) {
        alert("No offerings found.");
        return;
      }

      const { customerInfo } = await purchases.presentPaywall({ offering: currentOffering });
      
      // Optimistically call onSuccess. The listener will handle the state update.
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Paywall presentation or purchase error:", error);
      
      // RevenueCat JS SDK throws a CodedError. We can inspect the code.
      const isCancelled = error.code === 2; // PURCHASE_CANCELLED code from SDK

      if (isCancelled) {
          console.log("Purchase was cancelled by the user.");
          // No need to show an error screen for cancellation.
          return;
      }

      // For all other errors, show a dedicated error screen.
      setPurchaseError("Your purchase could not be completed. Please check your payment details and try again.");
      setView('purchaseError');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await Purchases.getSharedInstance().restorePurchases();
      const premiumEntitlement = customerInfo.entitlements.active["FamilyBubble Premium"];

      if (typeof premiumEntitlement !== "undefined") {
        setIsSubscribed(true);
        setIsLapsedSubscriber(false);
        alert("Your purchases have been restored.");
      } else {
        alert("No active subscriptions found to restore.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to restore purchases. Please try again.");
    }
  };

  const handleLoginBack = () => {
    if (joinToken) {
      setView('join');
    } else if (bubbleCreationData) {
      setView('create');
    } else {
      setView('welcome');
    }
  };

  const resetAuthFlow = () => {
    setView('login');
    setJoinToken(null);
    setBubbleCreationData(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (view === 'welcome') {
      return <Welcome 
                onLogin={resetAuthFlow} 
                onCreate={() => setView('create')}
                onJoin={() => setView('join')} 
              />;
    }
    if (view === 'join') {
      return <JoinBubble 
                onJoin={(token) => { setJoinToken(token); setView('login'); }} 
                onBack={() => setView('welcome')} 
              />;
    }
    if (view === 'create') {
      return <CreateBubbleFlow 
                handlePurchase={handlePurchase}
                onComplete={(data) => {
                  setBubbleCreationData(data);
                  // Go to a success screen instead of straight to the app
                  setView('purchaseSuccess');
                }}
                onBack={() => setView('welcome')}
              />;
    }
    if (view === 'purchaseSuccess') {
      return <PurchaseSuccessView 
                onContinue={async () => {
                  try {
                    const data = bubbleCreationData;
                    const userCredential = await auth.createUserWithEmailAndPassword(data.email, data.password);
                    const newUser = userCredential.user;

                    // Link anonymous RevenueCat user to the new Firebase user
                    if (anonymousId) {
                      console.log(`Logging into RevenueCat to link anonymous user ${anonymousId} to ${newUser.uid}`);
                      await Purchases.getSharedInstance().logIn(newUser.uid);
                      setAnonymousId(null);
                    }
                    // The onAuthStateChanged listener will now pick up the new user and switch to the main app view.
                  } catch (error) {
                    console.error("Firebase user creation failed:", error);
                    setPurchaseError(`Account creation failed: ${error.message}`);
                    setView('purchaseError');
                  }
                }} 
              />;
    }
    if (view === 'purchaseError') {
      return <PurchaseErrorView
                message={purchaseError}
                onRetry={() => {
                  setView('create');
                  setPurchaseError(null);
                }}
              />;
    }
    if (view === 'login') {
      return <Login onLoginSuccess={() => setView('main')} onBack={handleLoginBack} />;
    }
  }

  // This screen is now only for lapsed subscribers who log in
  if (view === 'main' && isLapsedSubscriber && !isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your Subscription has Expired</h1>
          <p className="text-gray-400 mb-8">Please renew your subscription to continue using premium features.</p>
          <button
            onClick={() => handlePurchase()}
            className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all"
          >
            Renew Subscription
          </button>
           <button
            onClick={handleLogout}
            className="mt-8 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Sign Out
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <MainApp 
        userId={currentUser.uid} 
        onLogout={handleLogout} 
        joinToken={joinToken} 
        bubbleCreationData={bubbleCreationData}
        onBubbleCreated={() => setBubbleCreationData(null)}
        isSubscribed={isSubscribed}
        onUpgrade={handlePurchase}
        onRestorePurchases={handleRestorePurchases}
        onInitiateCreate={() => setView('create')}
      />
    </div>
  );
}

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

const PurchaseErrorView = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-rose-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
          <XCircle size={64} className="mx-auto text-rose-500 mb-6" />
          <h1 className="text-4xl font-bold mb-2">Purchase Failed</h1>
          <p className="text-gray-400 mb-8">
            {message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/30 transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};