import React, { useState } from 'react';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { ArrowLeft, ChevronRight } from 'lucide-react';

const Login = ({ onLoginSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const configureRecaptcha = () => {
    // Check if recaptcha verifier already exists
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("Recaptcha verified");
        }
      });
    }
  }

  const handleSendCode = async () => {
    setLoading(true);
    configureRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error("Error sending verification code", error);
      alert("Error sending verification code. Please check the phone number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      // User signed in successfully.
      onLoginSuccess();
    } catch (error) {
      console.error("Error verifying code", error);
      alert("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-blue-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div id="recaptcha-container"></div>
      {/* Background Bubbles */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full animate-blob"></div>
        <div className="absolute bottom-0 -right-10 w-80 h-80 bg-blue-600/10 rounded-full animate-blob animation-delay-2000"></div>
      </div>

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
            <h1 className="text-4xl font-bold mb-2">
              {!confirmationResult ? 'Enter Your Phone Number' : 'Enter Verification Code'}
            </h1>
            <p className="text-gray-400">
              {!confirmationResult ? 'We will send you a verification code.' : `A code has been sent to +${phoneNumber}`}
            </p>
          </div>

          {!confirmationResult ? (
            <div className="space-y-6">
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full text-center font-bold text-2xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSendCode}
                disabled={!phoneNumber.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                Send Code
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="- - - - - -"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full text-center tracking-[0.5em] font-bold text-2xl px-4 py-5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleVerifyCode}
                disabled={!verificationCode.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                Verify & Sign In
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;