import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, LayoutDashboard, PoundSterling, BarChart3, Sun, Moon } from "lucide-react";
import EnquiriesTab from "@/components/admin/EnquiriesTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PricingTab from "@/components/admin/PricingTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin-login"); return; }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!isAdmin) { navigate("/admin-login"); return; }
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center gap-2 sm:gap-3">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-serif text-sm sm:text-lg text-primary">Admin</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(!dark)}
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              >
                {dark ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
              <a href="/" className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors">
                Site
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground h-7 sm:h-8 px-2 sm:px-3 text-xs"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" /> <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
          <Tabs defaultValue="enquiries" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted border border-border w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="enquiries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> <span className="truncate">Enquiries</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> <span className="truncate">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
                <PoundSterling className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> <span className="truncate">Pricing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enquiries">
              <EnquiriesTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
