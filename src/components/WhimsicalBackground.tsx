const WhimsicalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Elegant thin rainbow swirl - top right flowing down */}
      <svg
        className="absolute -top-20 -right-32 w-[900px] h-[1000px] opacity-85"
        viewBox="0 0 400 500"
        fill="none"
      >
        <defs>
          <linearGradient id="rainbow-swirl-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(225, 80%, 58%)" />
            <stop offset="20%" stopColor="hsl(275, 75%, 58%)" />
            <stop offset="40%" stopColor="hsl(340, 85%, 62%)" />
            <stop offset="60%" stopColor="hsl(25, 95%, 58%)" />
            <stop offset="80%" stopColor="hsl(45, 100%, 58%)" />
            <stop offset="100%" stopColor="hsl(340, 80%, 65%)" />
          </linearGradient>
          <linearGradient id="rainbow-swirl-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(140, 70%, 50%)" />
            <stop offset="30%" stopColor="hsl(180, 65%, 55%)" />
            <stop offset="60%" stopColor="hsl(275, 75%, 58%)" />
            <stop offset="100%" stopColor="hsl(340, 85%, 62%)" />
          </linearGradient>
          <linearGradient id="rainbow-swirl-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 100%, 58%)" />
            <stop offset="35%" stopColor="hsl(25, 95%, 60%)" />
            <stop offset="70%" stopColor="hsl(340, 80%, 65%)" />
            <stop offset="100%" stopColor="hsl(275, 70%, 60%)" />
          </linearGradient>
          <linearGradient id="rainbow-line-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(340, 85%, 65%)" />
            <stop offset="50%" stopColor="hsl(275, 75%, 60%)" />
            <stop offset="100%" stopColor="hsl(225, 80%, 58%)" />
          </linearGradient>
          <linearGradient id="rainbow-line-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45, 100%, 60%)" />
            <stop offset="50%" stopColor="hsl(25, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(340, 85%, 62%)" />
          </linearGradient>
          <linearGradient id="rainbow-line-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(140, 65%, 55%)" />
            <stop offset="50%" stopColor="hsl(180, 70%, 50%)" />
            <stop offset="100%" stopColor="hsl(225, 75%, 60%)" />
          </linearGradient>
        </defs>
        {/* Thin elegant curved lines */}
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 395 35 Q 315 95 295 195 Q 275 295 195 365 Q 115 435 35 495"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 410 50 Q 330 110 310 210 Q 290 310 210 380 Q 130 450 50 510"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {/* Thin swirl - bottom left flowing up */}
      <svg
        className="absolute -bottom-40 -left-40 w-[800px] h-[900px] opacity-80 rotate-180"
        viewBox="0 0 400 500"
        fill="none"
      >
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 395 40 Q 315 100 295 200 Q 275 300 195 370 Q 115 440 35 500"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 410 60 Q 330 120 310 220 Q 290 320 210 390 Q 130 460 50 520"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Decorative curved lines - like in reference image */}
      {/* Top area squiggles */}
      <svg className="absolute top-[5%] left-[15%] w-32 h-16 opacity-80" viewBox="0 0 100 40" fill="none">
        <path
          d="M5 20 Q15 5 30 20 Q45 35 60 20 Q75 5 95 20"
          stroke="url(#rainbow-line-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      
      <svg className="absolute top-[12%] right-[20%] w-24 h-20 opacity-75" viewBox="0 0 60 50" fill="none">
        {/* Crown shape */}
        <path
          d="M10 40 L15 15 L25 30 L30 10 L35 30 L45 15 L50 40"
          stroke="url(#rainbow-line-2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Star outline */}
      <svg className="absolute top-[8%] right-[35%] w-12 h-12 opacity-70" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 5 L23 15 L33 15 L25 22 L28 32 L20 26 L12 32 L15 22 L7 15 L17 15 Z"
          stroke="url(#rainbow-line-3)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wavy line - middle */}
      <svg className="absolute top-[25%] left-[5%] w-28 h-14 opacity-75" viewBox="0 0 80 35" fill="none">
        <path
          d="M5 25 Q20 5 40 20 Q60 35 75 15"
          stroke="url(#rainbow-line-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Arrow */}
      <svg className="absolute bottom-[35%] left-[60%] w-20 h-16 opacity-70" viewBox="0 0 60 50" fill="none">
        <path
          d="M5 25 Q15 25 25 20 Q35 15 45 25 L40 18 M45 25 L40 32"
          stroke="url(#rainbow-line-2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Heart outline */}
      <svg className="absolute bottom-[25%] left-[8%] w-16 h-14 opacity-80" viewBox="0 0 50 45" fill="none">
        <path
          d="M25 40 C5 25 5 10 15 8 C22 6 25 12 25 12 C25 12 28 6 35 8 C45 10 45 25 25 40"
          stroke="url(#rainbow-line-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Spiral */}
      <svg className="absolute top-[45%] right-[8%] w-20 h-20 opacity-75" viewBox="0 0 60 60" fill="none">
        <path
          d="M30 30 Q35 30 35 25 Q35 20 30 20 Q22 20 22 30 Q22 42 35 42 Q48 42 48 28 Q48 14 30 14"
          stroke="url(#rainbow-line-3)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Cloud outline */}
      <svg className="absolute top-[18%] left-[35%] w-24 h-16 opacity-65" viewBox="0 0 80 50" fill="none">
        <path
          d="M15 35 Q5 35 5 28 Q5 20 15 20 Q15 12 25 12 Q32 12 35 18 Q38 10 48 10 Q60 10 60 22 Q75 22 75 32 Q75 40 60 40 L20 40 Q10 40 10 35"
          stroke="url(#rainbow-line-2)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Lightning bolt */}
      <svg className="absolute top-[30%] left-[12%] w-12 h-18 opacity-75" viewBox="0 0 30 50" fill="none">
        <path
          d="M18 5 L8 22 L15 22 L12 45 L22 25 L15 25 Z"
          stroke="url(#rainbow-line-2)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Rainbow arc - thin lines */}
      <svg className="absolute top-[10%] left-[55%] w-32 h-20 opacity-55" viewBox="0 0 100 50" fill="none">
        <path d="M10 45 Q50 -5 90 45" stroke="hsl(340, 80%, 60%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M18 45 Q50 5 82 45" stroke="hsl(25, 90%, 58%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 45 Q50 15 74 45" stroke="hsl(45, 100%, 58%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M34 45 Q50 25 66 45" stroke="hsl(140, 65%, 50%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Fluffy clouds - softer */}
      <svg className="absolute top-10 left-10 w-48 h-32 opacity-60" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="60" rx="40" ry="28" fill="hsl(330, 70%, 75%)" />
        <ellipse cx="90" cy="52" rx="35" ry="32" fill="hsl(330, 70%, 78%)" />
        <ellipse cx="130" cy="55" rx="32" ry="26" fill="hsl(25, 70%, 80%)" />
        <ellipse cx="155" cy="62" rx="28" ry="24" fill="hsl(330, 65%, 82%)" />
      </svg>

      <svg className="absolute top-1/4 right-5 w-40 h-28 opacity-50" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="55" rx="36" ry="26" fill="hsl(25, 70%, 78%)" />
        <ellipse cx="85" cy="48" rx="32" ry="30" fill="hsl(20, 65%, 75%)" />
        <ellipse cx="125" cy="55" rx="38" ry="24" fill="hsl(340, 60%, 75%)" />
      </svg>

      <svg className="absolute bottom-28 right-16 w-36 h-24 opacity-45" viewBox="0 0 200 100" fill="none">
        <ellipse cx="60" cy="55" rx="40" ry="28" fill="hsl(275, 50%, 72%)" />
        <ellipse cx="110" cy="48" rx="38" ry="26" fill="hsl(225, 60%, 70%)" />
        <ellipse cx="150" cy="58" rx="32" ry="24" fill="hsl(280, 55%, 75%)" />
      </svg>

      {/* Smiling flower - right side (smaller) */}
      <svg className="absolute bottom-36 right-[15%] w-24 h-32 opacity-85 animate-float" viewBox="0 0 80 120" fill="none">
        <path d="M40 55 Q38 80 42 110" stroke="hsl(140, 60%, 45%)" strokeWidth="4" fill="none" />
        <ellipse cx="30" cy="82" rx="12" ry="6" fill="hsl(140, 60%, 50%)" transform="rotate(-30 30 82)" />
        <ellipse cx="52" cy="92" rx="10" ry="5" fill="hsl(140, 60%, 50%)" transform="rotate(25 52 92)" />
        <ellipse cx="40" cy="18" rx="12" ry="18" fill="white" />
        <ellipse cx="23" cy="33" rx="12" ry="18" fill="white" transform="rotate(-60 23 33)" />
        <ellipse cx="57" cy="33" rx="12" ry="18" fill="white" transform="rotate(60 57 33)" />
        <ellipse cx="23" cy="52" rx="12" ry="18" fill="white" transform="rotate(-30 23 52)" />
        <ellipse cx="57" cy="52" rx="12" ry="18" fill="white" transform="rotate(30 57 52)" />
        <circle cx="40" cy="40" r="14" fill="hsl(45, 100%, 60%)" />
        <circle cx="35" cy="38" r="2" fill="hsl(25, 30%, 25%)" />
        <circle cx="45" cy="38" r="2" fill="hsl(25, 30%, 25%)" />
        <path d="M35 44 Q40 48 45 44" stroke="hsl(25, 30%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      {/* Second flower - left side (smaller) */}
      <svg className="absolute top-[45%] left-[8%] w-20 h-28 opacity-70 animate-float" style={{ animationDelay: '0.8s' }} viewBox="0 0 80 120" fill="none">
        <path d="M40 55 Q42 80 38 110" stroke="hsl(140, 55%, 42%)" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="85" rx="10" ry="5" fill="hsl(140, 55%, 48%)" transform="rotate(20 50 85)" />
        <ellipse cx="40" cy="18" rx="10" ry="16" fill="hsl(340, 75%, 70%)" />
        <ellipse cx="25" cy="32" rx="10" ry="16" fill="hsl(340, 75%, 72%)" transform="rotate(-55 25 32)" />
        <ellipse cx="55" cy="32" rx="10" ry="16" fill="hsl(340, 75%, 72%)" transform="rotate(55 55 32)" />
        <ellipse cx="25" cy="48" rx="10" ry="16" fill="hsl(340, 75%, 70%)" transform="rotate(-25 25 48)" />
        <ellipse cx="55" cy="48" rx="10" ry="16" fill="hsl(340, 75%, 70%)" transform="rotate(25 55 48)" />
        <circle cx="40" cy="38" r="12" fill="hsl(35, 90%, 62%)" />
        <circle cx="36" cy="36" r="1.5" fill="hsl(25, 30%, 25%)" />
        <circle cx="44" cy="36" r="1.5" fill="hsl(25, 30%, 25%)" />
        <path d="M36 41 Q40 44 44 41" stroke="hsl(25, 30%, 25%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Cute worm - smaller */}
      <svg className="absolute bottom-20 left-[32%] w-14 h-10 opacity-75 animate-wiggle" viewBox="0 0 60 40" fill="none">
        <path d="M5 25 Q15 12 25 25 Q35 38 45 25 Q55 12 55 25" stroke="hsl(340, 70%, 65%)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="22" r="5" fill="hsl(340, 70%, 65%)" />
        <circle cx="53" cy="20" r="1.5" fill="hsl(25, 30%, 25%)" />
        <circle cx="57" cy="20" r="1.5" fill="hsl(25, 30%, 25%)" />
      </svg>

      {/* Sparkle stars */}
      <div className="absolute top-[12%] left-[32%] text-2xl animate-pulse-glow">✦</div>
      <div className="absolute top-[22%] right-[42%] text-lg animate-pulse-glow text-primary" style={{ animationDelay: '0.3s' }}>✦</div>
      <div className="absolute top-[42%] left-[15%] text-xl animate-pulse-glow text-secondary" style={{ animationDelay: '0.6s' }}>✦</div>
      <div className="absolute top-[32%] right-[18%] text-2xl animate-pulse-glow text-accent" style={{ animationDelay: '0.9s' }}>✦</div>
      <div className="absolute bottom-[32%] left-[48%] text-lg animate-pulse-glow" style={{ animationDelay: '0.4s' }}>✦</div>
      <div className="absolute bottom-[45%] right-[10%] text-xl animate-pulse-glow text-primary" style={{ animationDelay: '0.7s' }}>✦</div>
      <div className="absolute top-[62%] left-[68%] text-lg animate-pulse-glow text-secondary" style={{ animationDelay: '1s' }}>✦</div>

      {/* Colored dots - fewer and smaller */}
      <div className="absolute top-[18%] left-[52%] w-3 h-3 rounded-full bg-secondary animate-float" />
      <div className="absolute top-[28%] left-[22%] w-2.5 h-2.5 rounded-full bg-primary animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[48%] right-[28%] w-4 h-4 rounded-full bg-accent animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[38%] left-[35%] w-3 h-3 rounded-full bg-neon-purple animate-float" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-[68%] right-[42%] w-3 h-3 rounded-full bg-lime-green animate-float" style={{ animationDelay: '1.2s' }} />

      {/* Droplets - smaller */}
      <svg className="absolute top-[52%] right-[8%] w-6 h-9 opacity-70" viewBox="0 0 20 30" fill="hsl(200, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute bottom-[20%] left-[20%] w-5 h-8 opacity-60" viewBox="0 0 20 30" fill="hsl(340, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>

      {/* Hearts */}
      <div className="absolute top-[28%] left-[6%] text-2xl animate-float opacity-70" style={{ animationDelay: '0.3s' }}>💖</div>
      <div className="absolute bottom-[15%] right-[22%] text-xl animate-float opacity-65" style={{ animationDelay: '0.9s' }}>💗</div>

      {/* Floating emojis - fewer and smaller */}
      <div className="absolute bottom-24 right-[25%] text-4xl animate-wiggle opacity-70" style={{ animationDelay: '0.5s' }}>🌸</div>
      <div className="absolute top-[38%] left-6 text-3xl animate-spin-slow opacity-60">✨</div>
      <div className="absolute top-[72%] right-6 text-2xl animate-float opacity-65" style={{ animationDelay: '0.8s' }}>🌿</div>
      <div className="absolute top-[5%] left-[58%] text-2xl animate-wiggle opacity-65">⭐</div>
      <div className="absolute bottom-[58%] left-[78%] text-3xl animate-float opacity-60" style={{ animationDelay: '1.1s' }}>🦋</div>
    </div>
  );
};

export default WhimsicalBackground;
