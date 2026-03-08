const Marquee = () => {
  const message = "✦ CYBER B SURVIVORS ONLY ✦ CHAOS HUSTLERS CAN LOG OFF ✦ I LOVE WOMEN ✦ ULJHO GAY NAHI TO SULJHO KAY KAISAY MERI JAAN ✦ I AM QUITE MAD WITH THE KNOWLEDGE OF ALL I CAN NEVER KNOW ✦ ";
  
  return (
    <div className="w-full bg-gradient-to-r from-primary via-secondary to-accent overflow-hidden py-3 z-50 relative">
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
