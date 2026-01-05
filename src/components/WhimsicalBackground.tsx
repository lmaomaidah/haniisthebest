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
            <stop offset="25%" stopColor="hsl(275, 75%, 58%)" />
            <stop offset="50%" stopColor="hsl(340, 85%, 62%)" />
            <stop offset="75%" stopColor="hsl(25, 95%, 58%)" />
            <stop offset="100%" stopColor="hsl(45, 100%, 58%)" />
          </linearGradient>
        </defs>
        {/* Main thick swirl */}
        <path
          d="M 380 20 Q 300 80 280 180 Q 260 280 180 350 Q 100 420 20 480"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="50"
          fill="none"
          strokeLinecap="round"
        />
        {/* Second layer */}
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="35"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Third thin layer */}
        <path
          d="M 420 100 Q 340 160 320 260 Q 300 360 220 430 Q 140 500 60 560"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
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
          strokeWidth="45"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 400 60 Q 320 120 300 220 Q 280 320 200 390 Q 120 460 40 520"
          stroke="url(#rainbow-swirl-1)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Fluffy cloud - top left */}
      <svg
        className="absolute top-10 left-10 w-48 h-32 opacity-80"
        viewBox="0 0 200 100"
        fill="none"
      >
        <ellipse cx="50" cy="60" rx="45" ry="30" fill="hsl(330, 70%, 75%)" />
        <ellipse cx="90" cy="50" rx="40" ry="35" fill="hsl(330, 70%, 78%)" />
        <ellipse cx="130" cy="55" rx="35" ry="28" fill="hsl(25, 70%, 80%)" />
        <ellipse cx="160" cy="65" rx="30" ry="25" fill="hsl(330, 65%, 82%)" />
      </svg>

      {/* Fluffy cloud - right side */}
      <svg
        className="absolute top-1/3 right-5 w-40 h-28 opacity-70"
        viewBox="0 0 200 100"
        fill="none"
      >
        <ellipse cx="50" cy="55" rx="40" ry="28" fill="hsl(25, 70%, 78%)" />
        <ellipse cx="85" cy="50" rx="35" ry="30" fill="hsl(20, 65%, 75%)" />
        <ellipse cx="130" cy="55" rx="40" ry="25" fill="hsl(340, 60%, 75%)" />
      </svg>

      {/* Small cloud - bottom right */}
      <svg
        className="absolute bottom-32 right-20 w-36 h-24 opacity-60"
        viewBox="0 0 200 100"
        fill="none"
      >
        <ellipse cx="60" cy="55" rx="45" ry="30" fill="hsl(275, 50%, 72%)" />
        <ellipse cx="110" cy="50" rx="40" ry="28" fill="hsl(225, 60%, 70%)" />
        <ellipse cx="150" cy="58" rx="35" ry="25" fill="hsl(280, 55%, 75%)" />
      </svg>

      {/* Sparkle stars */}
      <div className="absolute top-[15%] left-[30%] text-xl animate-pulse-glow">✦</div>
      <div className="absolute top-[25%] right-[40%] text-sm animate-pulse-glow text-primary" style={{ animationDelay: '0.3s' }}>✦</div>
      <div className="absolute top-[45%] left-[15%] text-lg animate-pulse-glow text-secondary" style={{ animationDelay: '0.6s' }}>✦</div>
      <div className="absolute top-[35%] right-[25%] text-xl animate-pulse-glow text-accent" style={{ animationDelay: '0.9s' }}>✦</div>
      <div className="absolute bottom-[35%] left-[45%] text-sm animate-pulse-glow" style={{ animationDelay: '0.4s' }}>✦</div>
      <div className="absolute bottom-[45%] right-[15%] text-lg animate-pulse-glow text-primary" style={{ animationDelay: '0.7s' }}>✦</div>
      <div className="absolute top-[60%] left-[65%] text-sm animate-pulse-glow text-secondary" style={{ animationDelay: '1s' }}>✦</div>

      {/* Colored dots like in reference */}
      <div className="absolute top-[20%] left-[55%] w-3 h-3 rounded-full bg-secondary animate-float" />
      <div className="absolute top-[30%] left-[25%] w-2 h-2 rounded-full bg-primary animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[50%] right-[30%] w-4 h-4 rounded-full bg-accent animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[40%] left-[35%] w-2 h-2 rounded-full bg-neon-purple animate-float" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-[70%] right-[45%] w-3 h-3 rounded-full bg-lime-green animate-float" style={{ animationDelay: '1.2s' }} />

      {/* Droplet shapes */}
      <svg className="absolute top-[55%] right-[12%] w-6 h-8 opacity-70" viewBox="0 0 20 30" fill="hsl(200, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>
      <svg className="absolute bottom-[25%] left-[20%] w-5 h-7 opacity-60" viewBox="0 0 20 30" fill="hsl(340, 85%, 62%)">
        <path d="M10 0 Q0 15 10 28 Q20 15 10 0" />
      </svg>

      {/* Floating emojis */}
      <div className="absolute top-20 left-[20%] text-4xl animate-float opacity-80">🌙</div>
      <div className="absolute bottom-28 right-[25%] text-3xl animate-wiggle opacity-70" style={{ animationDelay: '0.5s' }}>🌸</div>
      <div className="absolute top-[40%] left-8 text-3xl animate-spin-slow opacity-60">✨</div>
      <div className="absolute bottom-20 left-[40%] text-2xl animate-float opacity-70" style={{ animationDelay: '1s' }}>🍑</div>
    </div>
  );
};

export default WhimsicalBackground;
