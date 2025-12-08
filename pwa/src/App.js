import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import MainApp from './components/bubble/MainApp';
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login';
import JoinBubble from './components/auth/JoinBubble';
import CreateBubbleFlow from './components/auth/CreateBubbleFlow';
import { Purchases } from '@revenuecat/purchases-js';

export default function FamilyBubbleApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('welcome'); // welcome, login, join, create, main
  const [joinToken, setJoinToken] = useState(null);
  const [bubbleCreationData, setBubbleCreationData] = useState(null);
  const [isPremium, setIsPremium] = useState(false); // New state for premium status

  // Initialize RevenueCat SDK once when the component mounts
  useEffect(() => {
    const revenueCatApiKey = process.env.REACT_APP_REVENUECAT_PUBLIC_API_KEY; // Replace with your actual RevenueCat public API key from .env.local or your build process. Find it in RevenueCat Dashboard -> API Keys.

    const unsubscribe = auth.onAuthStateChanged(async user => { // Made async to await Purchases.getCustomerInfo()
      setCurrentUser(user);
      setLoading(false);

      if (revenueCatApiKey && user && !Purchases.isConfigured) {
        Purchases.configure({ apiKey: revenueCatApiKey, appUserID: user.uid });
        console.log("RevenueCat SDK configured.");
      }

      if (user) {
        // Fetch RevenueCat customer info to determine premium status
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          if (customerInfo.entitlements.active.premium) { // Assuming 'premium' is your entitlement ID
            setIsPremium(true);
            console.log("User is premium.");
          } else {
            setIsPremium(false);
            console.log("User is not premium.");
          }
        } catch (e) {
          console.error("Error fetching RevenueCat customer info:", e);
          setIsPremium(false); // Assume not premium on error
        }
        setView('main');
      } else {
        setIsPremium(false); // Reset premium status on logout
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      setView('welcome');
      setJoinToken(null);
      setBubbleCreationData(null);
    });
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
                onComplete={(data) => { setBubbleCreationData(data); setView('login'); }}
                onBack={() => setView('welcome')}
                isPremium={isPremium} // Pass isPremium prop
              />;
    }
    if (view === 'login') {
      return <Login onLoginSuccess={() => setView('main')} onBack={handleLoginBack} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <MainApp 
        userId={currentUser.uid} 
        onLogout={handleLogout} 
        joinToken={joinToken} 
        bubbleCreationData={bubbleCreationData}
        onBubbleCreated={() => setBubbleCreationData(null)}
      />
    </div>
  );
}