import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, LogOut, ArrowRight, Trash2, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Favorite {
  id: string;
  recipe_name: string;
  recipe_data: any;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadFavorites(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setUser(session.user);
      await loadFavorites(session.user.id);
      await loadProfile(session.user.id);
    }
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else if (data) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const loadFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطا",
        description: "مشکل در بارگذاری علاقه‌مندی‌ها",
        variant: "destructive",
      });
    } else {
      setFavorites(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "خروج موفق",
      description: "از حساب خود خارج شدید",
    });
    navigate("/");
  };

  const handleDeleteFavorite = async (id: string) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "خطا",
        description: "مشکل در حذف از علاقه‌مندی‌ها",
        variant: "destructive",
      });
    } else {
      setFavorites(favorites.filter((f) => f.id !== id));
      toast({
        title: "حذف شد",
        description: "دستور پخت از علاقه‌مندی‌ها حذف شد",
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطا",
        description: "لطفاً یک فایل تصویری انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 2 مگابایت باشد",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "موفق",
        description: "عکس پروفایل با موفقیت به‌روزرسانی شد",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "خطا",
        description: "مشکل در آپلود عکس پروفایل",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-card p-4 md:p-6 lg:p-8 border border-primary/20 mb-6 md:mb-8">
            <div className="flex flex-col items-center gap-4 md:gap-6 md:flex-row md:items-start">
              <div className="relative">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="gradient-gold">
                    <User className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-7 w-7 md:h-8 md:w-8 rounded-full border-primary/30 bg-background"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  aria-label="تغییر عکس پروفایل"
                >
                  <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">
                  پروفایل من
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mb-0.5 md:mb-1 truncate max-w-[200px] md:max-w-none mx-auto md:mx-0">{user?.email}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {favorites.length} دستور پخت در علاقه‌مندی‌ها
                </p>
              </div>
              <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1 md:flex-none border-primary/30 text-sm"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 ml-1 md:ml-2" />
                  بازگشت
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none border-destructive/50 text-destructive hover:bg-destructive/10 text-sm"
                >
                  <LogOut className="w-4 h-4 ml-1 md:ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </Card>

          {/* Favorites Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h2 className="text-lg md:text-2xl font-bold text-foreground">
                دستورهای مورد علاقه من
              </h2>
            </div>

            {favorites.length === 0 ? (
              <Card className="glass-card p-8 md:p-12 border border-primary/20 text-center">
                <Heart className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4 opacity-50" />
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                  هنوز دستوری اضافه نکردید
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  با کلیک روی دکمه قلب، دستورهای مورد علاقه خود را ذخیره کنید
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="gradient-gold text-primary-foreground shadow-gold"
                >
                  شروع کنید
                </Button>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {favorites.map((favorite) => (
                  <Card
                    key={favorite.id}
                    className="glass-card p-4 md:p-6 border border-primary/20 hover:border-primary/40 smooth-transition"
                  >
                    <div className="flex items-start justify-between gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-xl font-bold text-foreground mb-1 md:mb-2 truncate">
                          {favorite.recipe_name}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          افزوده شده در:{" "}
                          {new Date(favorite.created_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteFavorite(favorite.id)}
                        variant="outline"
                        size="icon"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10 flex-shrink-0 w-8 h-8 md:w-10 md:h-10"
                        aria-label="حذف از علاقه‌مندی‌ها"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </Button>

                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
