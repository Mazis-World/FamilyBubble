import React, { useState, useEffect } from 'react';
import { Circle, Users, Plus, Send, AlertCircle, Check, X, LogOut, Share2, ChevronLeft, ArrowLeft, Settings } from 'lucide-react';

// ============================================================================
// MOCK BACKEND - UNIFIED BUBBLE PHILOSOPHY
// ============================================================================

let mockDB = {
  users: [
    { id: 'user1', email: 'owner@example.com', type: 'owner' },
    { id: 'user2', email: 'participant1@example.com', type: 'participant' },
    { id: 'user3', email: 'participant2@example.com', type: 'participant' }
  ],
  // ONE BUBBLE = ONE SHARED SPACE
  bubbles: [
    { 
      bubbleId: 'bubble1', 
      name: 'Family Safety Circle',
      createdBy: 'user1',
      createdAt: Date.now()
    }
  ],
  // All members belong to the SAME bubble
  members: [
    { memberId: 'member1', userId: 'user1', bubbleId: 'bubble1', name: 'Sarah', status: 'Safe', role: 'owner', joinedAt: Date.now() },
    { memberId: 'member2', userId: 'user2', bubbleId: 'bubble1', name: 'Mom', status: 'Busy', role: 'member', joinedAt: Date.now() },
    { memberId: 'member3', userId: 'user3', bubbleId: 'bubble1', name: 'Dad', status: 'Safe', role: 'member', joinedAt: Date.now() }
  ],
  referrals: []
};

const API = {
  // Create a new bubble (only when first user signs up)
  createBubble: async (userId, userName) => {
    const bubbleId = `bubble${Date.now()}`;
    const memberId = `member${Date.now()}`;
    
    mockDB.bubbles.push({
      bubbleId,
      name: `${userName}'s Bubble`,
      createdBy: userId,
      createdAt: Date.now()
    });

    mockDB.members.push({
      memberId,
      userId,
      bubbleId,
      name: userName,
      status: 'Safe',
      role: 'owner',
      joinedAt: Date.now()
    });

    return { bubbleId, memberId };
  },

  // Generate referral for the BUBBLE (not for individual user)
  generateReferral: async (bubbleId) => {
    const token = `BUB${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    mockDB.referrals.push({ 
      token, 
      bubbleId, 
      used: false,
      createdAt: Date.now()
    });
    return { token };
  },

  // Join existing bubble = you see the SAME bubble as everyone else
  joinBubble: async (token, userId, userName) => {
    const ref = mockDB.referrals.find(r => r.token === token && !r.used);
    if (!ref) throw new Error('Invalid invite code');
    
    const memberId = `member${Date.now()}`;
    mockDB.members.push({
      memberId,
      userId,
      bubbleId: ref.bubbleId,
      name: userName,
      status: 'Offline',
      role: 'member',
      joinedAt: Date.now()
    });

    ref.used = true;
    return { bubbleId: ref.bubbleId, memberId };
  },

  // Get the ONE bubble this user belongs to
  getUserBubble: async (userId) => {
    const member = mockDB.members.find(m => m.userId === userId);
    if (!member) return null;

    const bubble = mockDB.bubbles.find(b => b.bubbleId === member.bubbleId);
    const allMembers = mockDB.members.filter(m => m.bubbleId === member.bubbleId);
    
    return {
      bubble,
      currentMember: member,
      allMembers: allMembers.map(m => ({
        ...m,
        isMe: m.userId === userId
      }))
    };
  },

  // Update status in the shared bubble
  updateStatus: async (memberId, status) => {
    const member = mockDB.members.find(m => m.memberId === memberId);
    if (member) {
      member.status = status;
      member.lastUpdated = Date.now();
    }
    return { success: true };
  },

  // Everyone in the bubble can invite (optional: restrict to owner only)
  canInvite: async (memberId) => {
    const member = mockDB.members.find(m => m.memberId === memberId);
    // Philosophy: Anyone in the bubble can grow it
    return member ? true : false;
  },

  // Leave bubble
  leaveBubble: async (memberId) => {
    const index = mockDB.members.findIndex(m => m.memberId === memberId);
    if (index > -1) {
      mockDB.members.splice(index, 1);
    }
    return { success: true };
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

const SlideUpCard = ({ isOpen, onClose, children, title }) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-4" />
        {title && (
          <div className="px-6 pb-4 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};

const StatusButton = ({ status, active, onClick }) => {
  const colors = {
    Safe: active ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-gray-800 text-gray-400',
    Busy: active ? 'bg-amber-500 shadow-amber-500/50' : 'bg-gray-800 text-gray-400',
    Offline: active ? 'bg-gray-600 shadow-gray-600/50' : 'bg-gray-800 text-gray-400',
    Help: active ? 'bg-rose-500 shadow-rose-500/50' : 'bg-gray-800 text-gray-400'
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
        colors[status]
      } ${active ? 'text-white shadow-lg scale-105' : ''}`}
    >
      {status}
    </button>
  );
};

const MemberBubble = ({ member, onClick, isCenter = false, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getStatusColor = (status) => {
    const colors = {
      Safe: 'from-emerald-500 to-emerald-600',
      Busy: 'from-amber-500 to-amber-600',
      Offline: 'from-gray-500 to-gray-600',
      Help: 'from-rose-500 to-rose-600'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  const size = isCenter ? 'w-40 h-40' : 'w-28 h-28';
  const textSize = isCenter ? 'text-2xl' : 'text-lg';

  return (
    <div
      onClick={onClick}
      className={`${size} cursor-pointer transition-all duration-500 ease-out ${
        isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-full h-full bg-gradient-to-br ${getStatusColor(member.status)} rounded-full shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-110 transition-transform duration-300`}>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        {member.role === 'owner' && (
          <div className="absolute inset-0 border-4 border-white rounded-full opacity-60" />
        )}
        {member.isMe && (
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <span className="text-white text-xs font-bold">ME</span>
          </div>
        )}
        <div className={`${textSize} font-bold text-white z-10`}>
          {member.name}
        </div>
        <div className="text-sm text-white opacity-80 mt-1 z-10">
          {member.status}
        </div>
      </div>
    </div>
  );
};

const UnifiedBubbleView = ({ bubbleData, onStatusClick }) => {
  const { bubble, currentMember, allMembers } = bubbleData;
  const otherMembers = allMembers.filter(m => !m.isMe);
  const me = allMembers.find(m => m.isMe);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Bubble name at top */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-2xl font-bold text-white mb-1">{bubble.name}</h2>
        <p className="text-gray-400 text-sm">
          {allMembers.length} {allMembers.length === 1 ? 'person' : 'people'} in this bubble
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Center - Me */}
        {me && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MemberBubble 
              member={me} 
              onClick={() => onStatusClick(me)}
              isCenter={true}
            />
          </div>
        )}

        {/* Everyone else in orbit - THE SAME BUBBLE */}
        {otherMembers.map((member, index) => {
          const total = otherMembers.length;
          const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
          const radius = 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={member.memberId}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
            >
              <MemberBubble 
                member={member}
                onClick={() => {}}
                delay={index * 100}
              />
            </div>
          );
        })}

        {otherMembers.length === 0 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-xs">
              <p className="text-gray-400 text-sm mb-2">You're the first one here!</p>
              <p className="text-gray-500 text-xs">Invite others to grow this bubble</p>
            </div>
          </div>
        )}
      </div>

      {/* Info box explaining the philosophy */}
      <div className="px-6 pb-6">
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Circle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">One Bubble Philosophy</h3>
              <p className="text-blue-200 text-xs leading-relaxed">
                Everyone you see here shares the <strong>same bubble</strong>. When you joined, you entered this shared space. 
                Everyone sees everyone. No sub-bubbles, no hierarchies—just one connected circle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainApp = ({ userId, onLogout }) => {
  const [bubbleData, setBubbleData] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinToken, setJoinToken] = useState('');
  const [joinName, setJoinName] = useState('');

  useEffect(() => {
    loadBubble();
  }, [userId]);

  const loadBubble = async () => {
    const data = await API.getUserBubble(userId);
    if (data) {
      setBubbleData(data);
    } else {
      setShowJoin(true);
    }
  };

  const handleCreateBubble = async () => {
    await API.createBubble(userId, joinName || 'Me');
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


// ============================================================================
// MAIN APP
// ============================================================================

export default function FamilyBubbleApp() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (userType) => {
    const userId = userType === 'owner' ? 'user1' : 'new';
    setCurrentUser({ id: userId, type: userType });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-full shadow-2xl w-96 h-96 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30 animate-pulse">
              <Circle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">FamilyBubble</h1>
            <p className="text-gray-400">One bubble. One shared space.</p>
            
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center w-64">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">New Philosophy:</strong> When you join a bubble, 
                you join <em className="text-blue-400">the same bubble</em> as everyone else. 
                No individual networks—just one unified circle where everyone sees everyone.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* TODO: Implement real authentication */}
            <button
              onClick={() => handleLogin('owner')}
              className="w-48 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => handleLogin('new')}
              className="w-48 bg-gray-800 border border-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              Create or Join Bubble
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Experience the unified bubble philosophy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <MainApp userId={currentUser.id} onLogout={handleLogout} />
    </div>
  );
}
