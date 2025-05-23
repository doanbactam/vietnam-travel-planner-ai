
import React from 'react';
import { SectionDetail, ActivityItem } from '../types';

interface SectionProps {
  sectionDetail: SectionDetail;
}

const getIconForType = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'activity': return '📍';
    case 'food': return '🍲';
    case 'transport': return '🚗';
    case 'note': return '📌';
    case 'interaction': return '💬';
    default: return '🔹';
  }
};

export const Section: React.FC<SectionProps> = ({ sectionDetail }) => {
  const { title, items } = sectionDetail;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="py-3.5 border-b border-slate-200/80 last:border-b-0">
      <h4 className="text-lg font-semibold text-slate-800 mb-3.5">{title}</h4>
      <ul className="space-y-3 pl-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-sm">
            <span className="mr-3 pt-0.5 text-xl leading-none">
              {item.icon || getIconForType(item.type)}
            </span>
            <div className="flex-1">
              <p className="text-slate-700 leading-relaxed">{item.description}</p>
              {item.details && <p className="text-xs text-slate-500 mt-1">{item.details}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};