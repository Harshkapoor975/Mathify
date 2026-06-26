import React from "react";

export default function RotatingTarget() {
  return (
    <div className="matchmaking-loader">
      <div className="target-animation-container">
        {/* Outer rotating dashed ring */}
        <div className="target-outer-ring" />
        
        {/* Inner reverse-rotating ring */}
        <div className="target-inner-ring" />
        
        {/* Pulsing Crosshair SVG */}
        <svg
          className="target-crosshair"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Target Center Circle */}
          <circle cx="50" cy="50" r="6" fill="currentColor" />
          
          {/* Crosshair Lines */}
          <line x1="50" y1="10" x2="50" y2="35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="65" x2="50" y2="90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="10" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="65" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          
          {/* Corner Tech Accents */}
          <path d="M15 30 V15 H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 30 V15 H70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M15 70 V85 H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 70 V85 H70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
