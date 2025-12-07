import React, { useState, useEffect } from 'react';
import { API } from '../../services/bubble';
import UnifiedBubbleView from './UnifiedBubbleView';
import SlideUpCard from '../ui/SlideUpCard';
import StatusButton from '../ui/StatusButton';
import MemberBubble from '../ui/MemberBubble';
import { Circle, Plus, Share2, Settings } from 'lucide-react';

const MainApp = ({ userId, onLogout, joinToken: initialJoinToken, bubbleCreationData }) => {
  const [bubbleData, setBubbleData] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinToken, setJoinToken] = useState(initialJoinToken || '');
  const [joinName, setJoinName] = useState('');

  useEffect(() => {
    if (bubbleCreationData) {
      setJoinName(bubbleCreationData.userName);
    }
    loadBubble();
  }, [userId, bubbleCreationData]);
  
  const loadBubble = async () => {
    const data = await API.getUserBubble(userId);
    if (data) {
      setBubbleData(data);
    } else {
      setShowJoin(true);
    }
  };

  const handleCreateBubble = async () => {
    const bubbleName = bubbleCreationData ? bubbleCreationData.bubbleName : `${joinName}'s Bubble`;
    await API.createBubble(userId, joinName || 'Me', bubbleName);
    setShowJoin(false);
    loadBubble();
  };

  const handleJoinBubble = async () => {
    try {
      await API.joinBubble(joinToken, userId, joinName);
      setShowJoin(false);
      loadBubble();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (status) => {
    await API.updateStatus(bubbleData.currentMember.memberId, status);
    loadBubble();
    setShowStatus(false);
  };
  
  const handleLeaveBubble = async () => {
    await API.leaveBubble(bubbleData.currentMember.memberId);
    onLogout();
  };

  const handleGenerateInvite = async () => {
    const { token } = await API.generateReferral(bubbleData.bubble.bubbleId);
    setInviteToken(token);
    setShowInvite(true);
  };

  // Join or Create flow
  if (showJoin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30 animate-pulse">
              <Circle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to FamilyBubble</h1>
            <p className="text-gray-400">Create a new bubble or join an existing one</p>
          </div>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Your Name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleCreateBubble}
              disabled={!joinName}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create New Bubble
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-950 text-gray-500">or</span>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter Invite Code"
              value={joinToken}
              onChange={(e) => setJoinToken(e.target.value)}
              className="w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
            />

            <button
              onClick={handleJoinBubble}
              disabled={!joinName || !joinToken}
              className="w-full bg-gray-800 border border-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Existing Bubble
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs leading-relaxed">
              <strong className="text-white">One Bubble = One Shared Space.</strong> When you join a bubble, 
              you enter the same space as everyone else. There are no separate bubbles—just one connected circle 
              where everyone sees everyone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!bubbleData) return null;

  return (
    <div className="min-h-screen bg-gray-950 pb-32">
       <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-lg bg-opacity-95">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Circle size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">FamilyBubble</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="h-[calc(100vh-140px)]">
        <UnifiedBubbleView 
          bubbleData={bubbleData}
          onStatusClick={() => setShowStatus(true)}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowStatus(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/30"
          >
            Update Status
          </button>
          <button
            onClick={handleGenerateInvite}
            className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/30 transition-all"
          >
            <Plus size={20} />
            Invite
          </button>
        </div>
      </div>

      <SlideUpCard 
        isOpen={showStatus} 
        onClose={() => setShowStatus(false)}
        title="Update Your Status"
      >
        <div className="space-y-3">
          <StatusButton
            status="Safe"
            active={bubbleData?.currentMember?.status === 'Safe'}
            onClick={() => handleStatusChange('Safe')}
          />
          <StatusButton
            status="Busy"
            active={bubbleData?.currentMember?.status === 'Busy'}
            onClick={() => handleStatusChange('Busy')}
          />
          <StatusButton
            status="Offline"
            active={bubbleData?.currentMember?.status === 'Offline'}
            onClick={() => handleStatusChange('Offline')}
          />
          <StatusButton
            status="Help"
            active={bubbleData?.currentMember?.status === 'Help'}
            onClick={() => handleStatusChange('Help')}
          />
        </div>
        <p className="text-gray-400 text-sm mt-6 text-center">
          Everyone in your bubble will see your status instantly
        </p>
      </SlideUpCard>

      <SlideUpCard 
        isOpen={showInvite} 
        onClose={() => setShowInvite(false)}
        title="Invite Someone to Your Bubble"
      >
        <p className="text-gray-400 mb-6">Share this code to add someone to <strong className="text-white">{bubbleData?.bubble.name}</strong>:</p>
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl mb-6 text-center shadow-xl">
          <code className="text-3xl font-mono font-bold text-white">{inviteToken}</code>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-200 leading-relaxed">
            <strong className="text-white">Important:</strong> When they join, they'll see <strong>everyone</strong> in this bubble, 
            and everyone will see them. This is a shared space—not separate networks.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(inviteToken)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
          >
            Copy Code
          </button>
          <button
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </SlideUpCard>
      
      <SlideUpCard
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings & Profile"
      >
        <div className="flex flex-col items-center">
          <MemberBubble member={bubbleData.currentMember} isCenter={true} />
          <h3 className="text-2xl font-bold text-white mt-4">{bubbleData.currentMember.name}</h3>
          <p className="text-gray-400 capitalize">{bubbleData.currentMember.role}</p>
        </div>
        <div className="my-6 border-t border-gray-800" />
        <div className="space-y-3">
           <button
            onClick={handleLeaveBubble}
            className="w-full bg-red-800/50 border border-red-700/80 text-white py-3 rounded-xl font-semibold hover:bg-red-700/60 transition-all"
          >
            Leave Bubble
          </button>
          <button
            onClick={onLogout}
            className="w-full bg-gray-800 border border-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </SlideUpCard>

    </div>
  );
};

export default MainApp;
