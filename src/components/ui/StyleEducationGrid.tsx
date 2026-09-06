import React from 'react';
import { StyleVisualCard } from './StyleVisualCard';

export const STYLE_DEFINITIONS = [
  {
    name: 'Casual',
    image: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=400&q=80',
    description: 'Easy, comfortable everyday dressing without looking overdone.',
    keyElements: 'Relaxed • comfortable • effortless',
  },
  {
    name: 'Old money',
    image: 'https://images.unsplash.com/photo-1542131596-dec7b6e9a05b?w=400&q=80',
    description: 'Timeless, polished dressing built around classic pieces, restrained colours and clean tailoring.',
    keyElements: 'Timeless • tailored • restrained',
  },
  {
    name: 'Smart Casual',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
    description: 'More polished than casual, but relaxed enough for everyday social settings.',
    keyElements: 'Polished • versatile • balanced',
  },
  {
    name: 'Minimal',
    image: 'https://images.unsplash.com/photo-1434389678369-183424d52a28?w=400&q=80',
    description: 'Clean silhouettes, restrained colours and almost no visual clutter.',
    keyElements: 'Clean • tonal • structured',
  },
  {
    name: 'Classic',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80',
    description: 'Reliable timeless pieces that stay stylish beyond trends.',
    keyElements: 'Heritage • structured • reliable',
  },
  {
    name: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=400&q=80',
    description: 'Relaxed proportions, contemporary details and sneaker-led styling.',
    keyElements: 'Relaxed • graphic • contemporary',
  },
  {
    name: 'Formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
    description: 'Structured dressing for professional and formal occasions.',
    keyElements: 'Tailored • sharp • professional',
  },
  {
    name: 'Sporty',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    description: 'Comfort-first styling influenced by athletic clothing.',
    keyElements: 'Active • technical • comfortable',
  },
  {
    name: 'Edgy',
    image: 'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=400&q=80',
    description: 'Stronger contrast and statement details with a modern attitude.',
    keyElements: 'Dark • leather • statement',
  },
];

interface StyleEducationGridProps {
  selectedStyles: string[];
  onToggleStyle: (styleName: string) => void;
}

export function StyleEducationGrid({ selectedStyles, onToggleStyle }: StyleEducationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mt-4">
      {STYLE_DEFINITIONS.map((def) => (
        <StyleVisualCard
          key={def.name}
          styleName={def.name}
          image={def.image}
          description={def.description}
          keyElements={def.keyElements}
          selected={selectedStyles.includes(def.name)}
          onClick={() => onToggleStyle(def.name)}
        />
      ))}
    </div>
  );
}
