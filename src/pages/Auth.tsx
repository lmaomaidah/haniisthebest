import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import WhimsicalBackground from '@/components/WhimsicalBackground';
import { z } from 'zod';

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const passcodeSchema = z.string()
  .min(6, 'Passcode must be at least 6 characters')
  .max(20, 'Passcode must be less than 20 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; passcode?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const normalizeUsername = (value: string) => value.trim().toLowerCase();

  const validateForm = () => {
    const newErrors: { username?: string; passcode?: string } = {};

    const usernameNormalized = normalizeUsername(username);
    const usernameResult = usernameSchema.safeParse(usernameNormalized);
    if (!usernameResult.success) {
      newErrors.username = usernameResult.error.errors[0].message;
    }

    const passcodeResult = passcodeSchema.safeParse(passcode);
    if (!passcodeResult.success) {
      newErrors.passcode = passcodeResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const normalizedUsername = normalizeUsername(username);

      if (isLogin) {
        const { error } = await signIn(normalizedUsername, passcode);
        if (error) {
          toast({
            title: "Login Failed 😭",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back! 🎉",
            description: "Time to stir some shi up!"
          });
          navigate('/');
        }
      } else {
        // For signup, create a pseudo-email from username
        const email = `${normalizedUsername}@classmates.app`;
        const { error } = await signUp(email, passcode, normalizedUsername);

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Username taken! 😤",
              description: "Someone already snagged that username. Be more creative, bestie!",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Signup Failed 😭",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Account created! 🎊",
            description: "You're officially part of the chaos now!"
          });
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-6xl">✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Hacked Watermark */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}>
        <div style={{ color: 'rgba(255,0,0,0.15)', fontSize: 'clamp(2rem,8vw,5rem)', fontWeight: 900, fontFamily: 'monospace', transform: 'rotate(-20deg)', textAlign: 'center', lineHeight: 1.2 }}>
          ACCESS DENIED<br/>HACKED BY<br/>CHAOS HUSTLERS
        </div>
      </div>
      <WhimsicalBackground />
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Extra floating decorations for auth page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-10 left-10 text-6xl animate-float drop-shadow-[0_0_20px_rgba(255,100,150,0.8)]">🔐</div>
        <div className="absolute top-20 right-20 text-5xl animate-wiggle drop-shadow-[0_0_20px_rgba(100,200,255,0.8)]">✨</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-spin-slow drop-shadow-[0_0_20px_rgba(150,255,100,0.8)]">🎭</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-float drop-shadow-[0_0_20px_rgba(255,200,100,0.8)]">💫</div>
      </div>

      <Card className="w-full max-w-md bg-card/90 dark:bg-card/80 backdrop-blur-md border-4 border-primary shadow-glow relative z-10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold text-gradient">
            {isLogin ? 'Welcome Back!' : 'Join the Chaos!'}
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            {isLogin 
              ? "Enter your credentials to stir some shi up 🔥" 
              : "Create your account and become iconic ✨"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg font-bold">
                Username 👤
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Type your L here"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg p-6 border-2 border-secondary rounded-xl"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-lg font-bold">
                Passcode 🔑
              </Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Type your L here"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="text-lg p-6 border-2 border-secondary rounded-xl"
                disabled={loading}
              />
              {errors.passcode && (
                <p className="text-sm text-destructive">{errors.passcode}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-pink-blue text-white text-xl py-6 rounded-2xl shadow-glow hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin mr-2">✨</span>
              ) : null}
              {isLogin ? 'Enter the Drama 🎭' : 'Create Account 🚀'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary hover:text-primary/80 underline font-bold text-lg"
              disabled={loading}
            >
              {isLogin 
                ? "New here? Create an account! 🆕" 
                : "Already iconic? Log in! 🔙"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
