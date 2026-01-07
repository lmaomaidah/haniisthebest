const WhimsicalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Rainbow swirl - top right flowing down */}
      <svg
        className="absolute -top-20 -right-32 w-[900px] h-[1000px] opacity-95"
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
        </defs>
        {/* Main thick swirl */}
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="65"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="45"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 420 100 Q 340 160 320 260 Q 300 360 220 430 Q 140 500 60 560"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Rainbow swirl - bottom left flowing up */}
      <svg
        className="absolute -bottom-40 -left-40 w-[800px] h-[900px] opacity-90 rotate-180"
        viewBox="0 0 400 500"
        fill="none"
      >
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="60"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 420 100 Q 340 160 320 260 Q 300 360 220 430 Q 140 500 60 560"
          stroke="url(#rainbow-swirl-2)"
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>

      {/* Extra swirl - middle area */}
      <svg
        className="absolute top-1/3 -left-20 w-[500px] h-[600px] opacity-70"
        viewBox="0 0 300 400"
        fill="none"
      >
        <path
          d="M 280 30 Q 200 100 180 200 Q 160 300 80 370"
          stroke="url(#rainbow-swirl-3)"
          strokeWidth="35"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 290 70 Q 220 140 200 240 Q 180 340 100 400"
          stroke="url(#rainbow-swirl-3)"
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {/* Fluffy clouds */}
      <svg className="absolute top-10 left-10 w-60 h-40 opacity-90" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="60" rx="48" ry="32" fill="hsl(330, 70%, 75%)" />
        <ellipse cx="95" cy="50" rx="42" ry="38" fill="hsl(330, 70%, 78%)" />
        <ellipse cx="140" cy="55" rx="38" ry="30" fill="hsl(25, 70%, 80%)" />
        <ellipse cx="170" cy="65" rx="32" ry="28" fill="hsl(330, 65%, 82%)" />
      </svg>

      <svg className="absolute top-1/4 right-5 w-52 h-36 opacity-80" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="55" rx="44" ry="30" fill="hsl(25, 70%, 78%)" />
        <ellipse cx="90" cy="48" rx="38" ry="34" fill="hsl(20, 65%, 75%)" />
        <ellipse cx="140" cy="55" rx="44" ry="28" fill="hsl(340, 60%, 75%)" />
      </svg>

      <svg className="absolute bottom-28 right-16 w-48 h-32 opacity-70" viewBox="0 0 200 100" fill="none">
        <ellipse cx="60" cy="55" rx="48" ry="32" fill="hsl(275, 50%, 72%)" />
        <ellipse cx="115" cy="48" rx="44" ry="30" fill="hsl(225, 60%, 70%)" />
        <ellipse cx="160" cy="58" rx="38" ry="28" fill="hsl(280, 55%, 75%)" />
      </svg>

      <svg className="absolute top-[60%] left-8 w-44 h-28 opacity-65" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="55" rx="42" ry="28" fill="hsl(45, 80%, 75%)" />
        <ellipse cx="95" cy="50" rx="38" ry="32" fill="hsl(35, 75%, 72%)" />
        <ellipse cx="140" cy="55" rx="35" ry="26" fill="hsl(25, 70%, 78%)" />
      </svg>

      {/* Smiling flower - right side */}
      <svg className="absolute bottom-36 right-[15%] w-32 h-40 opacity-95 animate-float" viewBox="0 0 80 120" fill="none">
        {/* Stem */}
        <path d="M40 55 Q38 80 42 110" stroke="hsl(140, 60%, 45%)" strokeWidth="5" fill="none" />
        {/* Leaves */}
        <ellipse cx="30" cy="82" rx="14" ry="7" fill="hsl(140, 60%, 50%)" transform="rotate(-30 30 82)" />
        <ellipse cx="52" cy="92" rx="12" ry="6" fill="hsl(140, 60%, 50%)" transform="rotate(25 52 92)" />
        {/* Petals */}
        <ellipse cx="40" cy="18" rx="14" ry="20" fill="white" />
        <ellipse cx="23" cy="33" rx="14" ry="20" fill="white" transform="rotate(-60 23 33)" />
        <ellipse cx="57" cy="33" rx="14" ry="20" fill="white" transform="rotate(60 57 33)" />
        <ellipse cx="23" cy="52" rx="14" ry="20" fill="white" transform="rotate(-30 23 52)" />
        <ellipse cx="57" cy="52" rx="14" ry="20" fill="white" transform="rotate(30 57 52)" />
        {/* Center */}
        <circle cx="40" cy="40" r="16" fill="hsl(45, 100%, 60%)" />
        {/* Face */}
        <circle cx="34" cy="38" r="2.5" fill="hsl(25, 30%, 25%)" />
        <circle cx="46" cy="38" r="2.5" fill="hsl(25, 30%, 25%)" />
        <path d="M34 45 Q40 50 46 45" stroke="hsl(25, 30%, 25%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Second flower - left side */}
      <svg className="absolute top-[45%] left-[8%] w-28 h-36 opacity-85 animate-float" style={{ animationDelay: '0.8s' }} viewBox="0 0 80 120" fill="none">
        <path d="M40 55 Q42 80 38 110" stroke="hsl(140, 55%, 42%)" strokeWidth="4" fill="none" />
        <ellipse cx="50" cy="85" rx="12" ry="6" fill="hsl(140, 55%, 48%)" transform="rotate(20 50 85)" />
        {/* Petals - pink */}
        <ellipse cx="40" cy="18" rx="12" ry="18" fill="hsl(340, 75%, 70%)" />
        <ellipse cx="25" cy="32" rx="12" ry="18" fill="hsl(340, 75%, 72%)" transform="rotate(-55 25 32)" />
        <ellipse cx="55" cy="32" rx="12" ry="18" fill="hsl(340, 75%, 72%)" transform="rotate(55 55 32)" />
        <ellipse cx="25" cy="48" rx="12" ry="18" fill="hsl(340, 75%, 70%)" transform="rotate(-25 25 48)" />
        <ellipse cx="55" cy="48" rx="12" ry="18" fill="hsl(340, 75%, 70%)" transform="rotate(25 55 48)" />
        <circle cx="40" cy="38" r="14" fill="hsl(35, 90%, 62%)" />
        <circle cx="35" cy="36" r="2" fill="hsl(25, 30%, 25%)" />
        <circle cx="45" cy="36" r="2" fill="hsl(25, 30%, 25%)" />
        <path d="M35 42 Q40 46 45 42" stroke="hsl(25, 30%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      {/* Cute worm */}
      <svg className="absolute bottom-20 left-[32%] w-20 h-14 opacity-85 animate-wiggle" viewBox="0 0 60 40" fill="none">
        <path d="M5 25 Q15 12 25 25 Q35 38 45 25 Q55 12 55 25" stroke="hsl(340, 70%, 65%)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="22" r="6" fill="hsl(340, 70%, 65%)" />
        <circle cx="52" cy="19" r="2" fill="hsl(25, 30%, 25%)" />
        <circle cx="58" cy="19" r="2" fill="hsl(25, 30%, 25%)" />
      </svg>

      {/* Second worm - top */}
      <svg className="absolute top-[18%] right-[35%] w-16 h-12 opacity-70 animate-wiggle" style={{ animationDelay: '0.4s' }} viewBox="0 0 60 40" fill="none">
        <path d="M5 22 Q15 10 25 22 Q35 34 45 22 Q55 10 55 22" stroke="hsl(140, 60%, 55%)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="20" r="5" fill="hsl(140, 60%, 55%)" />
        <circle cx="53" cy="18" r="1.5" fill="hsl(25, 30%, 25%)" />
        <circle cx="57" cy="18" r="1.5" fill="hsl(25, 30%, 25%)" />
      </svg>

      {/* Rocket */}
      <svg className="absolute bottom-[42%] left-8 w-20 h-28 opacity-80 animate-float" style={{ animationDelay: '0.5s' }} viewBox="0 0 50 80" fill="none">
        <ellipse cx="25" cy="35" rx="14" ry="30" fill="hsl(25, 80%, 70%)" />
        <ellipse cx="25" cy="13" rx="9" ry="14" fill="hsl(340, 75%, 65%)" />
        <rect x="13" y="56" width="9" height="14" rx="3" fill="hsl(225, 70%, 55%)" />
        <rect x="28" y="56" width="9" height="14" rx="3" fill="hsl(225, 70%, 55%)" />
        <circle cx="25" cy="38" r="6" fill="hsl(200, 80%, 75%)" />
        {/* Flame */}
        <ellipse cx="25" cy="74" rx="8" ry="10" fill="hsl(45, 100%, 60%)" />
        <ellipse cx="25" cy="76" rx="5" ry="6" fill="hsl(25, 100%, 55%)" />
        <ellipse cx="25" cy="78" rx="3" ry="4" fill="hsl(340, 90%, 60%)" />
      </svg>

      {/* Second rocket - top right */}
      <svg className="absolute top-[25%] right-[8%] w-14 h-20 opacity-65 animate-float" style={{ animationDelay: '1.2s' }} viewBox="0 0 50 80" fill="none">
        <ellipse cx="25" cy="35" rx="12" ry="26" fill="hsl(180, 70%, 65%)" />
        <ellipse cx="25" cy="14" rx="8" ry="12" fill="hsl(275, 70%, 60%)" />
        <rect x="15" y="54" width="7" height="12" rx="2" fill="hsl(45, 85%, 55%)" />
        <rect x="28" y="54" width="7" height="12" rx="2" fill="hsl(45, 85%, 55%)" />
        <circle cx="25" cy="36" r="5" fill="hsl(200, 75%, 80%)" />
        <ellipse cx="25" cy="70" rx="6" ry="8" fill="hsl(25, 95%, 58%)" />
        <ellipse cx="25" cy="72" rx="4" ry="5" fill="hsl(45, 100%, 58%)" />
      </svg>

      {/* Moon with face */}
      <div className="absolute top-16 left-[18%] text-6xl animate-float opacity-90">🌙</div>
      
      {/* Sun */}
      <svg className="absolute top-[12%] right-[25%] w-20 h-20 opacity-75 animate-spin-slow" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="15" fill="hsl(45, 100%, 60%)" />
        {/* Rays */}
        <line x1="30" y1="5" x2="30" y2="12" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="48" x2="30" y2="55" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="5" y1="30" x2="12" y2="30" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="48" y1="30" x2="55" y2="30" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="12" y1="12" x2="17" y2="17" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="43" y1="43" x2="48" y2="48" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="12" y1="48" x2="17" y2="43" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="43" y1="17" x2="48" y2="12" stroke="hsl(45, 100%, 60%)" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Rainbow arc */}
      <svg className="absolute top-[8%] left-[40%] w-48 h-28 opacity-60" viewBox="0 0 200 100" fill="none">
        <path d="M10 90 Q100 -30 190 90" stroke="hsl(340, 80%, 60%)" strokeWidth="10" fill="none" />
        <path d="M25 90 Q100 -10 175 90" stroke="hsl(25, 90%, 58%)" strokeWidth="8" fill="none" />
        <path d="M40 90 Q100 10 160 90" stroke="hsl(45, 100%, 58%)" strokeWidth="6" fill="none" />
        <path d="M55 90 Q100 30 145 90" stroke="hsl(140, 65%, 50%)" strokeWidth="5" fill="none" />
        <path d="M70 90 Q100 50 130 90" stroke="hsl(225, 70%, 55%)" strokeWidth="4" fill="none" />
        <path d="M82 90 Q100 65 118 90" stroke="hsl(275, 70%, 58%)" strokeWidth="3" fill="none" />
      </svg>

      {/* Sparkle stars - more of them */}
      <div className="absolute top-[12%] left-[32%] text-3xl animate-pulse-glow">✦</div>
      <div className="absolute top-[22%] right-[42%] text-xl animate-pulse-glow text-primary" style={{ animationDelay: '0.3s' }}>✦</div>
      <div className="absolute top-[42%] left-[15%] text-2xl animate-pulse-glow text-secondary" style={{ animationDelay: '0.6s' }}>✦</div>
      <div className="absolute top-[32%] right-[18%] text-3xl animate-pulse-glow text-accent" style={{ animationDelay: '0.9s' }}>✦</div>
      <div className="absolute bottom-[32%] left-[48%] text-xl animate-pulse-glow" style={{ animationDelay: '0.4s' }}>✦</div>
      <div className="absolute bottom-[45%] right-[10%] text-2xl animate-pulse-glow text-primary" style={{ animationDelay: '0.7s' }}>✦</div>
      <div className="absolute top-[62%] left-[68%] text-xl animate-pulse-glow text-secondary" style={{ animationDelay: '1s' }}>✦</div>
      <div className="absolute top-[10%] right-[52%] text-lg animate-pulse-glow text-accent" style={{ animationDelay: '1.2s' }}>✦</div>
      <div className="absolute top-[55%] right-[28%] text-xl animate-pulse-glow text-lime-green" style={{ animationDelay: '0.2s' }}>✦</div>
      <div className="absolute bottom-[18%] left-[12%] text-2xl animate-pulse-glow text-neon-orange" style={{ animationDelay: '0.8s' }}>✦</div>
      <div className="absolute top-[38%] left-[55%] text-lg animate-pulse-glow text-neon-purple" style={{ animationDelay: '1.4s' }}>✦</div>
      <div className="absolute bottom-[55%] right-[38%] text-xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}>✦</div>

      {/* Colored dots - more of them */}
      <div className="absolute top-[18%] left-[52%] w-5 h-5 rounded-full bg-secondary animate-float" />
      <div className="absolute top-[28%] left-[22%] w-4 h-4 rounded-full bg-primary animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[48%] right-[28%] w-6 h-6 rounded-full bg-accent animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[38%] left-[35%] w-4 h-4 rounded-full bg-neon-purple animate-float" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-[68%] right-[42%] w-5 h-5 rounded-full bg-lime-green animate-float" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-[6%] left-[40%] w-3 h-3 rounded-full bg-neon-orange animate-float" style={{ animationDelay: '0.3s' }} />
      <div className="absolute bottom-[25%] right-[55%] w-4 h-4 rounded-full bg-secondary animate-float" style={{ animationDelay: '0.9s' }} />
      <div className="absolute top-[75%] left-[8%] w-5 h-5 rounded-full bg-primary animate-float" style={{ animationDelay: '1.4s' }} />
      <div className="absolute top-[35%] right-[5%] w-3 h-3 rounded-full bg-accent animate-float" style={{ animationDelay: '0.6s' }} />
      <div className="absolute bottom-[12%] left-[62%] w-4 h-4 rounded-full bg-lime-green animate-float" style={{ animationDelay: '1.1s' }} />

      {/* Droplets */}
      <svg className="absolute top-[52%] right-[8%] w-8 h-12 opacity-80" viewBox="0 0 20 30" fill="hsl(200, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute bottom-[20%] left-[20%] w-7 h-10 opacity-70" viewBox="0 0 20 30" fill="hsl(340, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute top-[35%] left-[4%] w-6 h-8 opacity-60" viewBox="0 0 20 30" fill="hsl(275, 75%, 60%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute top-[15%] right-[12%] w-5 h-7 opacity-55" viewBox="0 0 20 30" fill="hsl(45, 90%, 58%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute bottom-[42%] left-[65%] w-6 h-9 opacity-65" viewBox="0 0 20 30" fill="hsl(140, 70%, 50%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>

      {/* Hearts */}
      <div className="absolute top-[28%] left-[6%] text-3xl animate-float opacity-80" style={{ animationDelay: '0.3s' }}>💖</div>
      <div className="absolute bottom-[15%] right-[22%] text-2xl animate-float opacity-75" style={{ animationDelay: '0.9s' }}>💗</div>
      <div className="absolute top-[58%] right-[48%] text-xl animate-float opacity-70" style={{ animationDelay: '1.3s' }}>💜</div>

      {/* More floating emojis */}
      <div className="absolute bottom-24 right-[25%] text-5xl animate-wiggle opacity-80" style={{ animationDelay: '0.5s' }}>🌸</div>
      <div className="absolute top-[38%] left-6 text-4xl animate-spin-slow opacity-70">✨</div>
      <div className="absolute bottom-14 left-[40%] text-4xl animate-float opacity-80" style={{ animationDelay: '1s' }}>🍑</div>
      <div className="absolute top-[72%] right-6 text-3xl animate-float opacity-75" style={{ animationDelay: '0.8s' }}>🌿</div>
      <div className="absolute top-[5%] left-[58%] text-3xl animate-wiggle opacity-75">⭐</div>
      <div className="absolute bottom-[58%] left-[78%] text-4xl animate-float opacity-70" style={{ animationDelay: '1.1s' }}>🦋</div>
      <div className="absolute top-[82%] left-[25%] text-3xl animate-wiggle opacity-65" style={{ animationDelay: '0.6s' }}>🌈</div>
      <div className="absolute top-[48%] right-[2%] text-4xl animate-float opacity-70" style={{ animationDelay: '0.4s' }}>🎀</div>
      <div className="absolute bottom-8 right-[60%] text-3xl animate-wiggle opacity-75" style={{ animationDelay: '1.5s' }}>🔮</div>
      <div className="absolute top-[20%] left-[75%] text-2xl animate-float opacity-65" style={{ animationDelay: '0.7s' }}>🍭</div>
      <div className="absolute bottom-[28%] right-[72%] text-3xl animate-wiggle opacity-70" style={{ animationDelay: '0.2s' }}>🌻</div>

      {/* Squiggly lines */}
      <svg className="absolute top-[65%] left-[55%] w-32 h-12 opacity-50" viewBox="0 0 100 30" fill="none">
        <path d="M5 15 Q20 5 35 15 Q50 25 65 15 Q80 5 95 15" stroke="hsl(340, 75%, 60%)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-[8%] left-[5%] w-28 h-10 opacity-45" viewBox="0 0 100 30" fill="none">
        <path d="M5 15 Q20 25 35 15 Q50 5 65 15 Q80 25 95 15" stroke="hsl(225, 70%, 55%)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default WhimsicalBackground;
