import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Mail, Lock, Loader2 } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "خوش آمدید!",
          description: "با موفقیت وارد شدید",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;

        toast({
          title: "ثبت‌نام موفق!",
          description: "حساب کاربری شما ایجاد شد",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md glass-card p-8 border border-primary/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gradient-gold">کوک‌اِی‌آی</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isLogin ? "ورود به حساب" : "ثبت‌نام"}
          </h2>
          <p className="text-muted-foreground">
            {isLogin
              ? "برای دسترسی به علاقه‌مندی‌ها وارد شوید"
              : "برای شروع یک حساب بسازید"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              ایمیل
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pr-10"
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              رمز عبور
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                placeholder="••••••••"
                dir="ltr"
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال پردازش...
              </>
            ) : isLogin ? (
              "ورود"
            ) : (
              "ثبت‌نام"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary smooth-transition"
          >
            {isLogin ? (
              <>
                حساب کاربری ندارید؟{" "}
                <span className="text-primary font-semibold">ثبت‌نام کنید</span>
              </>
            ) : (
              <>
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <span className="text-primary font-semibold">وارد شوید</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
