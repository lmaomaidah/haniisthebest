const WhimsicalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Shared gradients - dark red tinted */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 100%, 15%)" />
            <stop offset="100%" stopColor="hsl(0, 100%, 12%)" />
          </linearGradient>
          <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 80%, 18%)" />
            <stop offset="100%" stopColor="hsl(0, 80%, 14%)" />
          </linearGradient>
          <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 70%, 12%)" />
            <stop offset="100%" stopColor="hsl(0, 70%, 10%)" />
          </linearGradient>
          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 100%, 18%)" />
            <stop offset="100%" stopColor="hsl(0, 100%, 14%)" />
          </linearGradient>
          <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 100%, 15%)" />
            <stop offset="100%" stopColor="hsl(0, 100%, 12%)" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 100%, 20%)" />
            <stop offset="100%" stopColor="hsl(0, 100%, 15%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* === TOP AREA DOODLES === */}
      <svg className="absolute top-[3%] left-[5%] w-20 h-12 opacity-85" viewBox="0 0 80 45" fill="none">
        <path d="M5 30 Q20 10 35 25 Q50 40 65 20 Q75 8 78 15" stroke="url(#grad-green)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[2%] left-[18%] w-16 h-16 opacity-80" viewBox="0 0 50 50" fill="none">
        <path d="M8 25 Q8 8 20 15 Q32 22 25 35 Q18 48 35 40" stroke="url(#grad-pink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[8%] left-[30%] w-16 h-12 opacity-80" viewBox="0 0 60 40" fill="none">
        <path d="M5 35 L15 8 L25 32 L35 8 L45 32 L55 8" stroke="url(#grad-purple)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className="absolute top-[4%] left-[48%] w-10 h-10 opacity-75" viewBox="0 0 40 40" fill="none">
        <path d="M20 5 L35 35 L5 35 Z" stroke="url(#grad-purple)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className="absolute top-[12%] left-[42%] w-6 h-6 opacity-75" viewBox="0 0 25 25" fill="none">
        <path d="M12 3 L22 22 L2 22 Z" fill="#1a0000" />
      </svg>

      <svg className="absolute top-[5%] left-[58%] w-12 h-14 opacity-80" viewBox="0 0 40 50" fill="none">
        <path d="M8 8 Q8 42 20 42 Q32 42 32 8" stroke="url(#grad-pink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[3%] right-[28%] w-8 h-8 opacity-75" viewBox="0 0 30 30" fill="none">
        <path d="M15 5 L15 25 M5 15 L25 15" stroke="url(#grad-purple)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[10%] right-[22%] w-5 h-5 opacity-70" viewBox="0 0 20 20" fill="none">
        <path d="M10 3 L10 17 M3 10 L17 10" stroke="url(#grad-green)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[2%] right-[15%] w-10 h-16 opacity-85" viewBox="0 0 35 55" fill="none">
        <path d="M8 8 Q28 15 18 28 Q8 41 28 48" stroke="url(#grad-yellow)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[6%] right-[5%] w-12 h-12 opacity-75" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="15" stroke="url(#grad-green)" strokeWidth="3" fill="none" />
      </svg>

      {/* === MIDDLE-TOP DOODLES === */}
      <svg className="absolute top-[15%] left-[3%] w-14 h-14 opacity-75" viewBox="0 0 50 50" fill="none">
        <path d="M10 25 Q10 10 25 10 Q40 10 40 25 Q40 40 25 40 Q15 40 18 30" stroke="url(#grad-green)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <div className="absolute top-[14%] left-[14%] flex gap-1 opacity-70">
        <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,0,0,0.08)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,0,0,0.08)' }} />
      </div>

      <svg className="absolute top-[18%] left-[20%] w-10 h-10 opacity-80" viewBox="0 0 40 40" fill="none">
        <path d="M20 35 C5 22 5 10 12 8 C17 6 20 10 20 10 C20 10 23 6 28 8 C35 10 35 22 20 35" stroke="url(#grad-yellow)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[22%] left-[8%] w-20 h-10 opacity-75" viewBox="0 0 70 35" fill="none">
        <path d="M5 18 Q20 5 35 18 Q50 31 65 18" stroke="url(#grad-pink)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M5 25 Q20 12 35 25 Q50 38 65 25" stroke="url(#grad-pink)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      </svg>

      <svg className="absolute top-[16%] right-[35%] w-10 h-10 opacity-70" viewBox="0 0 40 40" fill="none">
        <path d="M20 5 L23 15 L33 15 L25 22 L28 32 L20 26 L12 32 L15 22 L7 15 L17 15 Z" stroke="url(#grad-purple)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className="absolute top-[12%] right-[8%] w-8 h-8 opacity-70" viewBox="0 0 30 30" fill="none">
        <path d="M8 8 L22 22 M22 8 L8 22" stroke="url(#grad-orange)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-[15%] right-[4%] w-6 h-6 opacity-60" viewBox="0 0 25 25" fill="none">
        <path d="M6 6 L19 19 M19 6 L6 19" stroke="url(#grad-orange)" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* === MIDDLE AREA DOODLES === */}
      <svg className="absolute top-[30%] left-[5%] w-10 h-14 opacity-75" viewBox="0 0 35 50" fill="none">
        <path d="M17 45 L17 10 M7 20 L17 8 L27 20" stroke="url(#grad-green)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className="absolute top-[35%] left-[15%] w-14 h-14 opacity-75" viewBox="0 0 50 50" fill="none">
        <path d="M25 25 Q30 25 30 20 Q30 12 22 12 Q12 12 12 25 Q12 40 28 40 Q45 40 45 22" stroke="url(#grad-yellow)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[42%] left-[2%] w-24 h-8 opacity-70" viewBox="0 0 90 30" fill="none">
        <path d="M5 15 Q15 5 25 15 Q35 25 45 15 Q55 5 65 15 Q75 25 85 15" stroke="url(#grad-green)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[28%] right-[6%] w-12 h-12 opacity-70" viewBox="0 0 45 45" fill="none">
        <path d="M15 5 L15 20 M7 12 L23 12" stroke="url(#grad-purple)" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 25 L32 40 M25 32 L40 32" stroke="url(#grad-pink)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <svg className="absolute top-[38%] right-[15%] w-6 h-6 opacity-75" viewBox="0 0 25 25" fill="none">
        <circle cx="12" cy="12" r="8" fill="#1a0000" />
      </svg>

      <svg className="absolute top-[32%] right-[25%] w-14 h-10 opacity-70" viewBox="0 0 50 35" fill="none">
        <path d="M5 32 Q25 0 45 32" stroke="url(#grad-orange)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* === BOTTOM-MIDDLE DOODLES === */}
      <svg className="absolute bottom-[40%] left-[25%] w-16 h-10 opacity-75" viewBox="0 0 60 35" fill="none">
        <path d="M5 20 Q20 5 35 25 Q50 40 55 18" stroke="url(#grad-orange)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute bottom-[45%] left-[40%] w-6 h-6 opacity-70" viewBox="0 0 25 25" fill="none">
        <circle cx="12" cy="12" r="8" stroke="url(#grad-pink)" strokeWidth="2.5" fill="none" />
      </svg>

      <div className="absolute bottom-[42%] left-[48%] w-3 h-3 rounded-full opacity-75" style={{ background: '#1a0000' }} />

      <svg className="absolute bottom-[48%] right-[30%] w-6 h-6 opacity-70" viewBox="0 0 25 25" fill="none">
        <path d="M12 22 C2 14 2 6 7 5 C10 4 12 7 12 7 C12 7 14 4 17 5 C22 6 22 14 12 22" fill="#1a0000" />
      </svg>

      <svg className="absolute bottom-[38%] right-[12%] w-14 h-10 opacity-75" viewBox="0 0 50 35" fill="none">
        <path d="M5 25 Q15 8 25 20 Q35 32 45 15" stroke="url(#grad-purple)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* === BOTTOM AREA DOODLES === */}
      <svg className="absolute bottom-[25%] left-[5%] w-20 h-8 opacity-75" viewBox="0 0 75 30" fill="none">
        <path d="M5 15 Q18 5 32 15 Q46 25 60 15 Q70 8 72 15" stroke="url(#grad-pink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute bottom-[20%] left-[18%] w-8 h-8 opacity-70" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="10" stroke="url(#grad-yellow)" strokeWidth="2.5" fill="none" />
      </svg>

      <svg className="absolute bottom-[15%] left-[28%] w-10 h-8 opacity-65" viewBox="0 0 40 30" fill="none">
        <path d="M5 25 Q20 5 35 25" stroke="url(#grad-purple)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute bottom-[18%] left-[45%] w-12 h-12 opacity-75" viewBox="0 0 45 45" fill="none">
        <path d="M22 22 Q25 22 25 19 Q25 14 20 14 Q13 14 13 22 Q13 32 25 32 Q38 32 38 20" stroke="url(#grad-yellow)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <div className="absolute bottom-[12%] left-[55%] flex gap-2 opacity-70">
        <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,0,0,0.08)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,0,0,0.08)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,0,0,0.08)' }} />
      </div>

      <svg className="absolute bottom-[22%] right-[35%] w-6 h-6 opacity-70" viewBox="0 0 25 25" fill="none">
        <path d="M12 4 L22 21 L2 21 Z" stroke="url(#grad-green)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>

      <svg className="absolute bottom-[28%] right-[20%] w-10 h-14 opacity-70" viewBox="0 0 35 50" fill="none">
        <path d="M25 5 Q10 15 10 25 Q10 35 25 45" stroke="url(#grad-green)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="absolute bottom-[10%] right-[12%] w-14 h-8 opacity-70" viewBox="0 0 50 30" fill="none">
        <path d="M5 20 L15 8 L25 22 L35 8 L45 20" stroke="url(#grad-orange)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className="absolute bottom-[5%] right-[25%] w-6 h-6 opacity-65" viewBox="0 0 25 25" fill="none">
        <path d="M12 4 L12 21 M4 12 L21 12" stroke="url(#grad-pink)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* === LARGE FLOWING SWIRLS (CORNERS) === */}
      <svg className="absolute -top-10 -right-20 w-[500px] h-[600px] opacity-60" viewBox="0 0 250 300" fill="none">
        <path d="M 240 10 Q 180 50 170 120 Q 160 190 100 230 Q 40 270 10 290" stroke="url(#grad-purple)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 250 25 Q 190 65 180 135 Q 170 205 110 245 Q 50 285 20 305" stroke="url(#grad-pink)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </svg>

      <svg className="absolute -bottom-20 -left-20 w-[450px] h-[500px] opacity-55 rotate-180" viewBox="0 0 250 300" fill="none">
        <path d="M 240 10 Q 180 50 170 120 Q 160 190 100 230 Q 40 270 10 290" stroke="url(#grad-green)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 250 25 Q 190 65 180 135 Q 170 205 110 245 Q 50 285 20 305" stroke="url(#grad-yellow)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </svg>

      {/* === ANIMATED ELEMENTS === */}
      <div className="absolute top-[12%] left-[36%] text-xl animate-pulse-glow opacity-80" style={{ color: 'rgba(255,0,0,0.3)' }}>✦</div>
      <div className="absolute top-[25%] right-[40%] text-lg animate-pulse-glow opacity-75" style={{ animationDelay: '0.3s', color: 'rgba(255,0,0,0.25)' }}>✦</div>
      <div className="absolute top-[45%] left-[22%] text-lg animate-pulse-glow opacity-70" style={{ animationDelay: '0.6s', color: 'rgba(255,0,0,0.25)' }}>✦</div>
      <div className="absolute bottom-[35%] right-[18%] text-xl animate-pulse-glow opacity-75" style={{ animationDelay: '0.9s', color: 'rgba(255,0,0,0.3)' }}>✦</div>
      <div className="absolute bottom-[22%] left-[38%] text-lg animate-pulse-glow opacity-70" style={{ animationDelay: '0.4s', color: 'rgba(255,0,0,0.25)' }}>✦</div>

      {/* Floating dots - dark red */}
      <div className="absolute top-[20%] left-[55%] w-3 h-3 rounded-full animate-float opacity-60" style={{ background: 'rgba(255,0,0,0.08)' }} />
      <div className="absolute top-[50%] right-[30%] w-3 h-3 rounded-full animate-float opacity-55" style={{ animationDelay: '0.5s', background: 'rgba(255,0,0,0.08)' }} />
      <div className="absolute bottom-[30%] left-[65%] w-4 h-4 rounded-full animate-float opacity-50" style={{ animationDelay: '1s', background: 'rgba(255,0,0,0.08)' }} />

      {/* Dark flower - right side */}
      <svg className="absolute bottom-[30%] right-[8%] w-20 h-28 opacity-80 animate-float" viewBox="0 0 80 120" fill="none">
        <path d="M40 55 Q38 80 42 110" stroke="hsl(0, 60%, 15%)" strokeWidth="3" fill="none" />
        <ellipse cx="30" cy="82" rx="10" ry="5" fill="hsl(0, 60%, 15%)" transform="rotate(-30 30 82)" />
        <ellipse cx="52" cy="92" rx="8" ry="4" fill="hsl(0, 60%, 15%)" transform="rotate(25 52 92)" />
        <ellipse cx="40" cy="18" rx="10" ry="16" fill="#1a0000" />
        <ellipse cx="25" cy="32" rx="10" ry="16" fill="#1a0000" transform="rotate(-60 25 32)" />
        <ellipse cx="55" cy="32" rx="10" ry="16" fill="#1a0000" transform="rotate(60 55 32)" />
        <ellipse cx="25" cy="50" rx="10" ry="16" fill="#1a0000" transform="rotate(-30 25 50)" />
        <ellipse cx="55" cy="50" rx="10" ry="16" fill="#1a0000" transform="rotate(30 55 50)" />
        <circle cx="40" cy="40" r="12" fill="hsl(0, 100%, 15%)" />
        <circle cx="36" cy="38" r="1.5" fill="hsl(0, 0%, 10%)" />
        <circle cx="44" cy="38" r="1.5" fill="hsl(0, 0%, 10%)" />
        <path d="M36 43 Q40 46 44 43" stroke="hsl(0, 0%, 10%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Second dark flower - left side */}
      <svg className="absolute top-[40%] left-[6%] w-16 h-24 opacity-70 animate-float" style={{ animationDelay: '0.8s' }} viewBox="0 0 80 120" fill="none">
        <path d="M40 55 Q42 80 38 110" stroke="hsl(0, 55%, 12%)" strokeWidth="2.5" fill="none" />
        <ellipse cx="50" cy="85" rx="8" ry="4" fill="hsl(0, 55%, 12%)" transform="rotate(20 50 85)" />
        <ellipse cx="40" cy="18" rx="8" ry="14" fill="#1a0000" />
        <ellipse cx="27" cy="30" rx="8" ry="14" fill="#1a0000" transform="rotate(-55 27 30)" />
        <ellipse cx="53" cy="30" rx="8" ry="14" fill="#1a0000" transform="rotate(55 53 30)" />
        <ellipse cx="27" cy="46" rx="8" ry="14" fill="#1a0000" transform="rotate(-25 27 46)" />
        <ellipse cx="53" cy="46" rx="8" ry="14" fill="#1a0000" transform="rotate(25 53 46)" />
        <circle cx="40" cy="38" r="10" fill="hsl(0, 90%, 15%)" />
        <circle cx="37" cy="36" r="1.2" fill="hsl(0, 0%, 10%)" />
        <circle cx="43" cy="36" r="1.2" fill="hsl(0, 0%, 10%)" />
        <path d="M37 40 Q40 43 43 40" stroke="hsl(0, 0%, 10%)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>

      {/* Dark worm */}
      <svg className="absolute bottom-[15%] left-[35%] w-12 h-8 opacity-70 animate-wiggle" viewBox="0 0 60 40" fill="none">
        <path d="M5 25 Q15 12 25 25 Q35 38 45 25 Q55 12 55 25" stroke="hsl(0, 70%, 20%)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="22" r="4" fill="hsl(0, 70%, 20%)" />
        <circle cx="53" cy="20" r="1.2" fill="hsl(0, 0%, 10%)" />
        <circle cx="57" cy="20" r="1.2" fill="hsl(0, 0%, 10%)" />
      </svg>

      {/* Dark clouds */}
      <svg className="absolute top-8 left-8 w-36 h-24 opacity-45" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="60" rx="35" ry="24" fill="#1a0000" />
        <ellipse cx="85" cy="52" rx="30" ry="28" fill="#1a0000" />
        <ellipse cx="120" cy="58" rx="28" ry="22" fill="#1a0000" />
      </svg>

      <svg className="absolute top-[22%] right-4 w-32 h-22 opacity-40" viewBox="0 0 200 100" fill="none">
        <ellipse cx="50" cy="55" rx="32" ry="22" fill="#1a0000" />
        <ellipse cx="82" cy="48" rx="28" ry="26" fill="#1a0000" />
        <ellipse cx="115" cy="55" rx="32" ry="20" fill="#1a0000" />
      </svg>

      <svg className="absolute bottom-24 right-12 w-28 h-20 opacity-35" viewBox="0 0 200 100" fill="none">
        <ellipse cx="60" cy="55" rx="35" ry="24" fill="#1a0000" />
        <ellipse cx="105" cy="48" rx="32" ry="22" fill="#1a0000" />
        <ellipse cx="140" cy="58" rx="28" ry="20" fill="#1a0000" />
      </svg>
    </div>
  );
};

export default WhimsicalBackground;
