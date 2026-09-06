import React from 'react';

interface StyleVisualCardProps {
  styleName: string;
  image: string;
  description: string;
  keyElements: string;
  selected: boolean;
  onClick: () => void;
}

export function StyleVisualCard({ styleName, image, description, keyElements, selected, onClick }: StyleVisualCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
        selected ? 'border-slate-900 ring-2 ring-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'
      }`}
    >
      <div className="h-40 w-full bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={styleName}
          className={`w-full h-full object-cover transition-transform duration-500 ${selected ? 'scale-105' : 'hover:scale-105'}`}
          onError={(e) => {
             e.currentTarget.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80";
          }}
        />
      </div>
      <div className="p-4 bg-white h-full flex flex-col justify-start">
        <h4 className="font-editorial font-bold text-slate-900 text-base mb-1">{styleName}</h4>
        <p className="text-[11px] font-mono text-slate-500 mb-2 truncate">{keyElements}</p>
        <p className="text-xs text-slate-700 leading-snug">{description}</p>
      </div>
    </div>
  );
}
