import { cn } from '@/lib/utils';

const AVATAR_OPTIONS = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dog', emoji: '🐶', label: 'Puppy' },
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'ghost', emoji: '👻', label: 'Ghost' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'fairy', emoji: '🧚', label: 'Fairy' },
  { id: 'vampire', emoji: '🧛', label: 'Vampire' },
  { id: 'skull', emoji: '💀', label: 'Skull' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly' },
  { id: 'octopus', emoji: '🐙', label: 'Octopus' },
];

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

const AvatarPicker = ({ selected, onSelect }: AvatarPickerProps) => {
  return (
    <div className="space-y-3">
      <p className="text-center text-muted-foreground font-['Schoolbell'] text-lg">
        Pick your spirit animal ✨
      </p>
      <div className="grid grid-cols-4 gap-3">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.emoji)}
            className={cn(
              "relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200",
              "hover:scale-110 hover:shadow-lg cursor-pointer",
              selected === avatar.emoji
                ? "border-primary bg-primary/15 shadow-[0_0_16px_hsl(var(--primary)/0.4)] scale-105"
                : "border-border bg-card/60 hover:border-muted-foreground/40"
            )}
          >
            <span className="text-3xl drop-shadow-md">{avatar.emoji}</span>
            <span className={cn(
              "text-[10px] font-bold tracking-wide uppercase",
              selected === avatar.emoji ? "text-primary" : "text-muted-foreground"
            )}>
              {avatar.label}
            </span>
            {selected === avatar.emoji && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] text-primary-foreground">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;
export { AVATAR_OPTIONS };
