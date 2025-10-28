import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, LogOut, ArrowRight, Trash2 } from "lucide-react";
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
    }
    setLoading(false);
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
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-card p-6 md:p-8 border border-primary/20 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  پروفایل من
                </h1>
                <p className="text-muted-foreground mb-1">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {favorites.length} دستور پخت در علاقه‌مندی‌ها
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="border-primary/30"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  بازگشت
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </Card>

          {/* Favorites Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                دستورهای مورد علاقه من
              </h2>
            </div>

            {favorites.length === 0 ? (
              <Card className="glass-card p-12 border border-primary/20 text-center">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  هنوز دستوری اضافه نکردید
                </h3>
                <p className="text-muted-foreground mb-6">
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
              <div className="grid gap-4">
                {favorites.map((favorite) => (
                  <Card
                    key={favorite.id}
                    className="glass-card p-6 border border-primary/20 hover:border-primary/40 smooth-transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {favorite.recipe_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          افزوده شده در:{" "}
                          {new Date(favorite.created_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteFavorite(favorite.id)}
                        variant="outline"
                        size="icon"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
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
