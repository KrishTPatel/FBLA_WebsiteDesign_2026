import React from 'react';
import './GeoBg.css';

export default function GeoBg() {
  const symbols = ["∑", "∫", "π", "∞", "√", "∂", "θ", "Δ", "≈", "∈"];

  return (
    <div className="geo-bg" aria-hidden="true">
      {/* Decorative background circles */}
      <div className="geo-circle c1"></div>
      <div className="geo-circle c2"></div>
      
      {/* Floating Math Symbols */}
      {symbols.map((sym, i) => (
        <div 
          key={i} 
          className="math-sym" 
          style={{
            top: `${(i * 15) % 90}%`,
            left: `${(i * 25) % 90}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${15 + (i % 5)}s`
          }}
        >
          {sym}
        </div>
      ))}
    </div>
  );
}