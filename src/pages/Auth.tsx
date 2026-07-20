import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Mail, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { lovable } from "@/integrations/lovable";

// Validation schemas
const emailSchema = z.string().trim().email("ایمیل معتبر نیست").max(255, "ایمیل بیش از حد طولانی است");
const passwordSchema = z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد").max(72, "رمز عبور بیش از حد طولانی است");
const phoneSchema = z.string().regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود");
const nameSchema = z.string().trim().min(1, "این فیلد الزامی است").max(50, "نام بیش از حد طولانی است");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateField = (field: string, value: string): string | null => {
    try {
      switch (field) {
        case 'email':
          emailSchema.parse(value);
          break;
        case 'password':
          passwordSchema.parse(value);
          break;
        case 'phone':
          phoneSchema.parse(value);
          break;
        case 'firstName':
        case 'lastName':
          nameSchema.parse(value);
          break;
      }
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "مقدار نامعتبر";
      }
      return "مقدار نامعتبر";
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    
    // Validate email
    const emailError = validateField('email', email);
    if (emailError) newErrors.email = emailError;
    
    // Validate password
    const passwordError = validateField('password', password);
    if (passwordError) newErrors.password = passwordError;
    
    // Validation for signup
    if (!isLogin) {
      // Validate confirm password
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیستند";
      }
      
      // Validate first name
      const firstNameError = validateField('firstName', firstName);
      if (firstNameError) newErrors.firstName = firstNameError;
      
      // Validate last name
      const lastNameError = validateField('lastName', lastName);
      if (lastNameError) newErrors.lastName = lastNameError;
      
      // Validate phone
      const phoneError = validateField('phone', phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "خطای اعتبارسنجی",
        description: "لطفاً خطاهای فرم را برطرف کنید",
        variant: "destructive",
      });
      return;
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
        // Direct signup without SMS verification
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError } = await supabase.auth.signUp({
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
        
        if (signUpError) throw signUpError;
        
        toast({
          title: "ثبت‌نام موفق!",
          description: "حساب کاربری شما ایجاد شد",
        });
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
            {isForgotPassword ? "بازیابی رمز عبور" : isLogin ? "ورود به حساب" : "ثبت‌نام"}
          </h2>
          <p className="text-muted-foreground">
            {isForgotPassword
              ? "ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود"
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
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                  }}
                  required
                  placeholder="نام خود را وارد کنید"
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  نام خانوادگی
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                  }}
                  required
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  شماره موبایل
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  required
                  placeholder="09123456789"
                  dir="ltr"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                required
                className={`pr-10 ${errors.email ? "border-destructive" : ""}`}
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                required
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                placeholder="••••••••"
                dir="ltr"
                minLength={8}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  required
                  className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  placeholder="••••••••"
                  dir="ltr"
                  minLength={8}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
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

        {!isForgotPassword && (
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
