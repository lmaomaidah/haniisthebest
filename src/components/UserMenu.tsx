import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Shield, Settings } from 'lucide-react';
import { ProfileAvatarEditor } from '@/components/ProfileAvatarEditor';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function UserMenu() {
  const { profile, isAdmin, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const avatarUrl = profile?.avatar_url;
  const isEmoji = avatarUrl && !avatarUrl.startsWith('http');
  const isImage = avatarUrl && avatarUrl.startsWith('http');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full border-2 border-primary/50 hover:border-primary bg-card/80 backdrop-blur-sm gap-2 pl-1.5"
          >
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
              {isImage ? (
                <img src={avatarUrl!} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">{isEmoji ? avatarUrl : '👤'}</span>
              )}
            </div>
            <span className="font-bold">{profile?.username || 'User'}</span>
            {isAdmin && <span>👑</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-card/95 backdrop-blur-md border-2 border-primary/30"
        >
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Avatar</span>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center cursor-pointer">
                  <Shield className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={signOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Avatar editor dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient font-['Luckiest_Guy']">
              Edit Your Avatar 🎨
            </DialogTitle>
          </DialogHeader>
          <ProfileAvatarEditorInline onDone={() => setSettingsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Inline editor that doesn't open its own dialog
function ProfileAvatarEditorInline({ onDone }: { onDone: () => void }) {
  const { profile } = useAuth();
  return (
    <div className="flex flex-col items-center gap-4">
      <ProfileAvatarEditor currentAvatar={profile?.avatar_url || null} size="lg" editable />
      <p className="text-sm text-muted-foreground">Click your avatar above to change it</p>
    </div>
  );
}
