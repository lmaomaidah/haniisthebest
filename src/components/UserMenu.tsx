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
import { User, LogOut, Shield } from 'lucide-react';

export function UserMenu() {
  const { profile, isAdmin, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full border-2 border-primary/50 hover:border-primary bg-card/80 backdrop-blur-sm"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="font-bold">{profile?.username || 'User'}</span>
          {isAdmin && <span className="ml-2">👑</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-card/95 backdrop-blur-md border-2 border-primary/30"
      >
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          onClick={signOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
