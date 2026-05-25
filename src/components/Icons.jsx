import React from 'react';

// Custom inline SVG icons matching Lucide styling (24x24, stroke-width=2, round caps)
const createIcon = (paths, defaultColor = 'currentColor') => {
  return ({ size = 20, className = '', color = defaultColor, style = {} }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={style}
    >
      {paths}
    </svg>
  );
};

export const Play = createIcon([
  <polygon key="1" points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />
]);

export const Pause = createIcon([
  <rect key="1" x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />,
  <rect key="2" x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
]);

export const Activity = createIcon([
  <path key="1" d="M22 12h-4l-3 9L9 3l-3 9H2" />
]);

export const RefreshCw = createIcon([
  <path key="1" d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />,
  <path key="2" d="M3 3v5h5" />,
  <path key="3" d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />,
  <path key="4" d="M16 16h5v5" />
]);

export const Search = createIcon([
  <circle key="1" cx="11" cy="11" r="8" />,
  <line key="2" x1="21" y1="21" x2="16.65" y2="16.65" />
]);

export const User = createIcon([
  <path key="1" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />,
  <circle key="2" cx="12" cy="7" r="4" />
]);

export const Filter = createIcon([
  <polygon key="1" points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
]);

export const ShieldAlert = createIcon([
  <path key="1" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  <line key="2" x1="12" y1="8" x2="12" y2="12" />,
  <circle key="3" cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
]);

export const Info = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <line key="2" x1="12" y1="16" x2="12" y2="12" />,
  <line key="3" x1="12" y1="8" x2="12.01" y2="8" />
]);

export const Award = createIcon([
  <circle key="1" cx="12" cy="8" r="7" />,
  <polyline key="2" points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
]);

export const Settings = createIcon([
  <circle key="1" cx="12" cy="12" r="3" />,
  <path key="2" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
]);

export const Bell = createIcon([
  <path key="1" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />,
  <path key="2" d="M13.73 21a2 2 0 0 1-3.46 0" />
]);

export const Brain = createIcon([
  <path key="1" d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />,
  <path key="2" d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
]);

export const Heart = createIcon([
  <path key="1" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
]);

export const Sliders = createIcon([
  <line key="1" x1="4" y1="21" x2="4" y2="14" />,
  <line key="2" x1="4" y1="10" x2="4" y2="3" />,
  <line key="3" x1="12" y1="21" x2="12" y2="12" />,
  <line key="4" x1="12" y1="8" x2="12" y2="3" />,
  <line key="5" x1="20" y1="21" x2="20" y2="16" />,
  <line key="6" x1="20" y1="12" x2="20" y2="3" />,
  <line key="7" x1="2" y1="14" x2="6" y2="14" />,
  <line key="8" x1="10" y1="8" x2="14" y2="8" />,
  <line key="9" x1="18" y1="16" x2="22" y2="16" />
]);

export const TrendingUp = createIcon([
  <polyline key="1" points="23 6 13.5 15.5 8.5 10.5 1 18" />,
  <polyline key="2" points="17 6 23 6 23 12" />
]);

export const AlertTriangle = createIcon([
  <path key="1" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  <line key="2" x1="12" y1="9" x2="12" y2="13" />,
  <circle key="3" cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
]);

export const Users = createIcon([
  <path key="1" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />,
  <circle key="2" cx="9" cy="7" r="4" />,
  <path key="3" d="M23 21v-2a4 4 0 0 0-3-3.87" />,
  <path key="4" d="M16 3.13a4 4 0 0 1 0 7.75" />
]);

export const FileText = createIcon([
  <path key="1" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />,
  <polyline key="2" points="14 2 14 8 20 8" />,
  <line key="3" x1="16" y1="13" x2="8" y2="13" />,
  <line key="4" x1="16" y1="17" x2="8" y2="17" />,
  <polyline key="5" points="10 9 9 9 8 9" />
]);

export const Database = createIcon([
  <ellipse key="1" cx="12" cy="5" rx="9" ry="3" />,
  <path key="2" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />,
  <path key="3" d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
]);

export const Zap = createIcon([
  <polygon key="1" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
]);

export const Volume2 = createIcon([
  <polygon key="1" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />,
  <path key="2" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
]);

export const VolumeX = createIcon([
  <polygon key="1" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />,
  <line key="2" x1="23" y1="9" x2="17" y2="15" />,
  <line key="3" x1="17" y1="9" x2="23" y2="15" />
]);

export const Share2 = createIcon([
  <circle key="1" cx="18" cy="5" r="3" />,
  <circle key="2" cx="6" cy="12" r="3" />,
  <circle key="3" cx="18" cy="19" r="3" />,
  <line key="4" x1="8.59" y1="13.51" x2="15.42" y2="17.49" />,
  <line key="5" x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
]);

export const Check = createIcon([
  <polyline key="1" points="20 6 9 17 4 12" />
]);

export const Cpu = createIcon([
  <rect key="1" x="4" y="4" width="16" height="16" rx="2" />,
  <rect key="2" x="9" y="9" width="6" height="6" />,
  <line key="3" x1="9" y1="1" x2="9" y2="4" />,
  <line key="4" x1="15" y1="1" x2="15" y2="4" />,
  <line key="5" x1="9" y1="20" x2="9" y2="23" />,
  <line key="6" x1="15" y1="20" x2="15" y2="23" />,
  <line key="7" x1="20" y1="9" x2="23" y2="9" />,
  <line key="8" x1="20" y1="15" x2="23" y2="15" />,
  <line key="9" x1="1" y1="9" x2="4" y2="9" />,
  <line key="10" x1="1" y1="15" x2="4" y2="15" />
]);

export const Video = createIcon([
  <polygon key="1" points="23 7 16 12 23 17 23 7" />,
  <rect key="2" x="1" y="5" width="15" height="14" rx="2" />
]);

export const Link2 = createIcon([
  <path key="1" d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />,
  <line key="2" x1="8" y1="12" x2="16" y2="12" />
]);
