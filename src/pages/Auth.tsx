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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً ایمیل خود را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "ایمیل ارسال شد",
        description: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد",
      });
      
      setIsForgotPassword(false);
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

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast({
        title: "خطا",
        description: "لطفاً کد تأیید 6 رقمی را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email',
      });
      
      if (error) throw error;
      
      toast({
        title: "تأیید موفق!",
        description: "ایمیل شما تأیید شد و وارد شدید",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "کد تأیید نامعتبر یا منقضی شده است",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for signup
    if (!isLogin) {
      if (password !== confirmPassword) {
        toast({
          title: "خطا",
          description: "رمز عبور و تکرار آن یکسان نیستند",
          variant: "destructive",
        });
        return;
      }
      
      if (!firstName.trim() || !lastName.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً نام و نام خانوادگی را وارد کنید",
          variant: "destructive",
        });
        return;
      }
      
      if (!phone.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً شماره موبایل را وارد کنید",
          variant: "destructive",
        });
        return;
      }
    }
    
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
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone,
            }
          },
        });
        if (error) throw error;

        toast({
          title: "کد تأیید ارسال شد!",
          description: "لطفاً کد 6 رقمی ارسال شده به ایمیلتان را وارد کنید",
        });
        
        setIsVerifying(true);
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Handle duplicate email
      if (error.message?.includes("User already registered") || 
          error.message?.includes("user_already_exists")) {
        errorMessage = "این ایمیل قبلاً در سیستم ثبت شده است";
      }
      
      // Handle duplicate phone number
      if (error.message?.includes("profiles_phone_unique")) {
        errorMessage = "این شماره موبایل قبلاً در سیستم ثبت شده است";
      }
      
      toast({
        title: "خطا",
        description: errorMessage,
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
            {isForgotPassword ? "بازیابی رمز عبور" : isVerifying ? "تأیید ایمیل" : isLogin ? "ورود به حساب" : "ثبت‌نام"}
          </h2>
          <p className="text-muted-foreground">
            {isForgotPassword
              ? "ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود"
              : isVerifying
              ? "کد تأیید ارسال شده به ایمیلتان را وارد کنید"
              : isLogin
              ? "برای دسترسی به علاقه‌مندی‌ها وارد شوید"
              : "برای شروع یک حساب بسازید"}
          </p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                "ارسال لینک بازیابی"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-muted-foreground hover:text-primary smooth-transition"
              >
                بازگشت به ورود
              </button>
            </div>
          </form>
        ) : isVerifying ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-foreground">
                کد تأیید
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                placeholder="123456"
                dir="ltr"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-sm text-muted-foreground text-center">
                کد 6 رقمی ارسال شده به {email} را وارد کنید
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال تأیید...
                </>
              ) : (
                "تأیید کد"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsVerifying(false);
                  setVerificationCode("");
                }}
                className="text-sm text-muted-foreground hover:text-primary smooth-transition"
              >
                بازگشت
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  نام
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="نام خود را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  نام خانوادگی
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  شماره موبایل
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="09123456789"
                  dir="ltr"
                />
              </div>
            </>
          )}

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

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                تکرار رمز عبور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="••••••••"
                  dir="ltr"
                  minLength={6}
                />
              </div>
            </div>
          )}

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

          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary smooth-transition"
              >
                رمز عبور را فراموش کرده‌اید؟
              </button>
            </div>
          )}
        </form>
        )}

        {!isForgotPassword && !isVerifying && (
          <div className="mt-6 text-center">
            <button
              type="button"
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
        )}
      </Card>
    </div>
  );
};

export default Auth;
