const Marquee = () => {
  const message = "💀 HACKED BY CHAOS HUSTLERS 💀 SYSTEM COMPROMISED 💀 YOU'VE BEEN PWNED 💀 THE LAME ZONE IS UNDER ATTACK 💀 CHAOS REIGNS 💀 lol get rekt 💀 ";
  
  return (
    <div className="w-full overflow-hidden py-3 z-50 relative" style={{ background: '#000', border: '1px solid #ff0000' }}>
      {/* Decorative borders */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-orange via-lime-green to-neon-purple" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-purple via-lime-green to-neon-orange" />
      
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="text-background font-bold text-sm md:text-base tracking-wider mx-4">
          {message}
        </span>
        <span className="text-background font-bold text-sm md:text-base tracking-wider mx-4">
          {message}
        </span>
        <span className="text-background font-bold text-sm md:text-base tracking-wider mx-4">
          {message}
        </span>
        <span className="text-background font-bold text-sm md:text-base tracking-wider mx-4">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Marquee;
