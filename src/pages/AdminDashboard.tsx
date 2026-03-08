import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, LayoutDashboard, PoundSterling, BarChart3 } from "lucide-react";
import EnquiriesTab from "@/components/admin/EnquiriesTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PricingTab from "@/components/admin/PricingTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-navy-dark flex items-center justify-center">
        <div className="text-primary-foreground/50">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Header */}
      <header className="border-b border-navy-light/20 bg-navy-dark/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-gold" />
            <span className="font-serif text-lg text-gold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-primary-foreground/40 hover:text-gold transition-colors">
              View Site
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-navy-light/30"
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Tabs defaultValue="enquiries" className="space-y-6">
          <TabsList className="bg-navy-light/30 border border-navy-light/20">
            <TabsTrigger value="enquiries" className="data-[state=active]:bg-gold data-[state=active]:text-navy text-primary-foreground/60">
              <LayoutDashboard className="h-4 w-4 mr-1.5" /> Enquiries
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gold data-[state=active]:text-navy text-primary-foreground/60">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-gold data-[state=active]:text-navy text-primary-foreground/60">
              <PoundSterling className="h-4 w-4 mr-1.5" /> Pricing
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
  );
};

export default AdminDashboard;
