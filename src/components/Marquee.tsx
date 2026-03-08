const Marquee = () => {
  const message = "✦ I hope everyone in cyber b dies a painful and slow death ✦ F the chaos hustlers and everyone in cyber except the pretty girls ✦ i love women ✦ uljho gay nahi to suljho kay kaisay meri jaan ✦ I am gone quite mad with the knowledge of accepting the overwhelming number of things I can never know, places I can never go, and people I can never be ✦ ";
  
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
