const Marquee = () => {
  const message = "✦ WELCOME TO THE CHAOS ✦ EARLY BIRD TICKETS ON SALE NOW ✦ RATE YOUR CLASSMATES ✦ STIR SOME SHI UP ✦ TIER LISTS ARE THE NEW DEMOCRACY ✦ SHIP-O-METER LOADING... ✦ BE ICONIC OR BE FORGOTTEN ✦ THE JUDGEMENT AWAITS ✦ ";
  
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
