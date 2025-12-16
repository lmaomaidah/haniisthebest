import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
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

  const validateForm = () => {
    const newErrors: { username?: string; passcode?: string } = {};
    
    const usernameResult = usernameSchema.safeParse(username);
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
      if (isLogin) {
        const email = `${username}@classmates.app`;
        const { error } = await signIn(email, passcode);
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
        const email = `${username}@classmates.app`;
        const { error } = await signUp(email, passcode, username);
        
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
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                placeholder="your_iconic_name"
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
                placeholder="••••••"
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
