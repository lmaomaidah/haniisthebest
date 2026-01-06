const WhimsicalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Rainbow swirl - top right flowing down */}
      <svg
        className="absolute -top-20 -right-32 w-[800px] h-[900px] opacity-90"
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
        </defs>
        {/* Main thick swirl */}
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="55"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 420 100 Q 340 160 320 260 Q 300 360 220 430 Q 140 500 60 560"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Rainbow swirl - bottom left flowing up */}
      <svg
        className="absolute -bottom-40 -left-40 w-[700px] h-[800px] opacity-85 rotate-180"
        viewBox="0 0 400 500"
        fill="none"
      >
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="50"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="35"
          fill="none"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>

      {/* Fluffy clouds */}
      <svg className="absolute top-10 left-10 w-52 h-36 opacity-85" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="60" rx="45" ry="30" fill="hsl(330, 70%, 75%)" />
        <ellipse cx="90" cy="50" rx="40" ry="35" fill="hsl(330, 70%, 78%)" />
        <ellipse cx="130" cy="55" rx="35" ry="28" fill="hsl(25, 70%, 80%)" />
        <ellipse cx="160" cy="65" rx="30" ry="25" fill="hsl(330, 65%, 82%)" />
      </svg>

      <svg className="absolute top-1/3 right-5 w-44 h-32 opacity-75" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="55" rx="40" ry="28" fill="hsl(25, 70%, 78%)" />
        <ellipse cx="85" cy="50" rx="35" ry="30" fill="hsl(20, 65%, 75%)" />
        <ellipse cx="130" cy="55" rx="40" ry="25" fill="hsl(340, 60%, 75%)" />
      </svg>

      <svg className="absolute bottom-32 right-20 w-40 h-28 opacity-65" viewBox="0 0 200 100" fill="none">
        <ellipse cx="60" cy="55" rx="45" ry="30" fill="hsl(275, 50%, 72%)" />
        <ellipse cx="110" cy="50" rx="40" ry="28" fill="hsl(225, 60%, 70%)" />
        <ellipse cx="150" cy="58" rx="35" ry="25" fill="hsl(280, 55%, 75%)" />
      </svg>

      {/* Smiling flower - right side */}
      <svg className="absolute bottom-40 right-[15%] w-28 h-36 opacity-90 animate-float" viewBox="0 0 80 120" fill="none">
        {/* Stem */}
        <path d="M40 55 Q38 80 42 110" stroke="hsl(140, 60%, 45%)" strokeWidth="4" fill="none" />
        {/* Leaves */}
        <ellipse cx="32" cy="85" rx="12" ry="6" fill="hsl(140, 60%, 50%)" transform="rotate(-30 32 85)" />
        <ellipse cx="50" cy="95" rx="10" ry="5" fill="hsl(140, 60%, 50%)" transform="rotate(25 50 95)" />
        {/* Petals */}
        <ellipse cx="40" cy="20" rx="12" ry="18" fill="white" />
        <ellipse cx="25" cy="35" rx="12" ry="18" fill="white" transform="rotate(-60 25 35)" />
        <ellipse cx="55" cy="35" rx="12" ry="18" fill="white" transform="rotate(60 55 35)" />
        <ellipse cx="25" cy="50" rx="12" ry="18" fill="white" transform="rotate(-30 25 50)" />
        <ellipse cx="55" cy="50" rx="12" ry="18" fill="white" transform="rotate(30 55 50)" />
        {/* Center */}
        <circle cx="40" cy="40" r="14" fill="hsl(45, 100%, 60%)" />
        {/* Face */}
        <circle cx="35" cy="38" r="2" fill="hsl(25, 30%, 25%)" />
        <circle cx="45" cy="38" r="2" fill="hsl(25, 30%, 25%)" />
        <path d="M35 44 Q40 48 45 44" stroke="hsl(25, 30%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      {/* Cute worm */}
      <svg className="absolute bottom-24 left-[30%] w-16 h-12 opacity-80 animate-wiggle" viewBox="0 0 60 40" fill="none">
        <path d="M5 25 Q15 15 25 25 Q35 35 45 25 Q55 15 55 25" stroke="hsl(340, 70%, 65%)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="22" r="5" fill="hsl(340, 70%, 65%)" />
        <circle cx="53" cy="20" r="1.5" fill="hsl(25, 30%, 25%)" />
        <circle cx="57" cy="20" r="1.5" fill="hsl(25, 30%, 25%)" />
      </svg>

      {/* Rocket */}
      <svg className="absolute bottom-[40%] left-10 w-16 h-24 opacity-75 animate-float" style={{ animationDelay: '0.5s' }} viewBox="0 0 50 80" fill="none">
        <ellipse cx="25" cy="35" rx="12" ry="28" fill="hsl(25, 80%, 70%)" />
        <ellipse cx="25" cy="15" rx="8" ry="12" fill="hsl(340, 75%, 65%)" />
        <rect x="15" y="55" width="8" height="12" rx="2" fill="hsl(225, 70%, 55%)" />
        <rect x="27" y="55" width="8" height="12" rx="2" fill="hsl(225, 70%, 55%)" />
        <circle cx="25" cy="38" r="5" fill="hsl(200, 80%, 75%)" />
        {/* Flame */}
        <ellipse cx="25" cy="72" rx="6" ry="8" fill="hsl(45, 100%, 60%)" />
        <ellipse cx="25" cy="74" rx="4" ry="5" fill="hsl(25, 100%, 55%)" />
      </svg>

      {/* Moon with face */}
      <div className="absolute top-20 left-[20%] text-5xl animate-float opacity-85">🌙</div>
      
      {/* Sparkle stars */}
      <div className="absolute top-[15%] left-[35%] text-2xl animate-pulse-glow">✦</div>
      <div className="absolute top-[25%] right-[40%] text-lg animate-pulse-glow text-primary" style={{ animationDelay: '0.3s' }}>✦</div>
      <div className="absolute top-[45%] left-[18%] text-xl animate-pulse-glow text-secondary" style={{ animationDelay: '0.6s' }}>✦</div>
      <div className="absolute top-[35%] right-[22%] text-2xl animate-pulse-glow text-accent" style={{ animationDelay: '0.9s' }}>✦</div>
      <div className="absolute bottom-[35%] left-[50%] text-lg animate-pulse-glow" style={{ animationDelay: '0.4s' }}>✦</div>
      <div className="absolute bottom-[48%] right-[12%] text-xl animate-pulse-glow text-primary" style={{ animationDelay: '0.7s' }}>✦</div>
      <div className="absolute top-[65%] left-[70%] text-lg animate-pulse-glow text-secondary" style={{ animationDelay: '1s' }}>✦</div>
      <div className="absolute top-[12%] right-[55%] text-sm animate-pulse-glow text-accent" style={{ animationDelay: '1.2s' }}>✦</div>

      {/* Colored dots */}
      <div className="absolute top-[20%] left-[55%] w-4 h-4 rounded-full bg-secondary animate-float" />
      <div className="absolute top-[30%] left-[25%] w-3 h-3 rounded-full bg-primary animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[50%] right-[30%] w-5 h-5 rounded-full bg-accent animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[40%] left-[38%] w-3 h-3 rounded-full bg-neon-purple animate-float" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-[70%] right-[45%] w-4 h-4 rounded-full bg-lime-green animate-float" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-[8%] left-[42%] w-2 h-2 rounded-full bg-neon-orange animate-float" style={{ animationDelay: '0.3s' }} />

      {/* Droplets */}
      <svg className="absolute top-[55%] right-[10%] w-7 h-10 opacity-75" viewBox="0 0 20 30" fill="hsl(200, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute bottom-[22%] left-[22%] w-6 h-9 opacity-65" viewBox="0 0 20 30" fill="hsl(340, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute top-[38%] left-[5%] w-5 h-7 opacity-55" viewBox="0 0 20 30" fill="hsl(275, 75%, 60%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>

      {/* More floating emojis */}
      <div className="absolute bottom-28 right-[28%] text-4xl animate-wiggle opacity-75" style={{ animationDelay: '0.5s' }}>🌸</div>
      <div className="absolute top-[40%] left-8 text-3xl animate-spin-slow opacity-65">✨</div>
      <div className="absolute bottom-16 left-[42%] text-3xl animate-float opacity-75" style={{ animationDelay: '1s' }}>🍑</div>
      <div className="absolute top-[75%] right-8 text-2xl animate-float opacity-70" style={{ animationDelay: '0.8s' }}>🌿</div>
    </div>
  );
};

export default WhimsicalBackground;