import React from 'react';

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

export default SlideUpCard;
