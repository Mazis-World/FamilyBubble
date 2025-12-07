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

export const API = {
  // Create a new bubble (only when first user signs up)
  createBubble: async (userId, userName, bubbleName) => {
    const bubbleId = `bubble${Date.now()}`;
    const memberId = `member${Date.now()}`;
    
    mockDB.bubbles.push({
      bubbleId,
      name: bubbleName || `${userName}'s Bubble`,
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