import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AvatarPicker from '@/components/AvatarPicker';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileAvatarEditorProps {
  currentAvatar: string | null;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function ProfileAvatarEditor({ currentAvatar, size = 'md', editable = true }: ProfileAvatarEditorProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'emoji' | 'upload'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState(currentAvatar || '🦊');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  const isEmoji = currentAvatar && !currentAvatar.startsWith('http');
  const isImageUrl = currentAvatar && currentAvatar.startsWith('http');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Only JPG, PNG, and WebP!', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB please!', variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setDragOffset({ x: 0, y: 0 });
    setScale(1);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!previewUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  }, [previewUrl, dragOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleSaveEmoji = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: selectedEmoji }).eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Avatar updated! ✨' });
      setOpen(false);
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!user || !fileInputRef.current?.files?.[0]) return;
    setUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      
      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-avatars').getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      if (error) throw error;

      await refreshProfile();
      toast({ title: 'Profile picture updated! 📸' });
      setOpen(false);
      setPreviewUrl(null);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const avatarDisplay = (
    <div className={cn(
      "rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/50 bg-card",
      sizeClasses[size],
      editable && "cursor-pointer group relative"
    )}>
      {isImageUrl ? (
        <img src={currentAvatar!} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{currentAvatar || '🦊'}</span>
      )}
      {editable && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <Camera className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );

  if (!editable) return avatarDisplay;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{avatarDisplay}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient font-['Luckiest_Guy']">
            Edit Your Avatar 🎨
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === 'emoji' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('emoji')}
            className="flex-1 rounded-xl"
          >
            😎 Emoji
          </Button>
          <Button
            variant={tab === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('upload')}
            className="flex-1 rounded-xl"
          >
            <Upload className="h-4 w-4 mr-1" /> Upload Photo
          </Button>
        </div>

        {tab === 'emoji' ? (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.3)]">
                <span className="text-4xl">{selectedEmoji}</span>
              </div>
            </div>
            <AvatarPicker selected={selectedEmoji} onSelect={setSelectedEmoji} />
            <Button
              onClick={handleSaveEmoji}
              disabled={uploading}
              className="w-full gradient-pink-blue text-white rounded-xl py-5"
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Emoji Avatar ✨
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Circle preview with drag-to-adjust */}
            <div className="flex justify-center">
              <div
                className="w-40 h-40 rounded-full border-4 border-dashed border-primary/50 overflow-hidden relative bg-muted/30 cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="absolute w-full h-full object-cover pointer-events-none"
                    style={{
                      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${scale})`,
                      transformOrigin: 'center',
                    }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-xs">Choose a photo</span>
                  </div>
                )}
              </div>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-3 px-4">
                <span className="text-xs text-muted-foreground">Zoom</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Drag to reposition · JPG, PNG, or WebP · Max 5MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" /> Choose File
              </Button>
              <Button
                onClick={handleUploadImage}
                disabled={!previewUrl || uploading}
                className="flex-1 gradient-pink-blue text-white rounded-xl"
              >
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Photo 📸
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
