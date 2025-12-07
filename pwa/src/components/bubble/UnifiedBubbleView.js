import React from 'react';
import MemberBubble from '../ui/MemberBubble';
import { Circle } from 'lucide-react';

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

export default UnifiedBubbleView;
