import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, RefreshCw, Calculator, PoundSterling } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface ConfigRow {
  id: string;
  config_key: string;
  config_value: any;
  label: string | null;
  description: string | null;
}

const PricingTab = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricing_config")
      .select("*")
      .order("config_key");

    if (!error && data) {
      const rows = data as ConfigRow[];
      setConfigs(rows);
      const vals: Record<string, any> = {};
      rows.forEach((r) => { vals[r.config_key] = r.config_value; });
      setEditValues(vals);
    }
    setLoading(false);
  };

  const handleSave = async (configKey: string) => {
    setSaving(configKey);
    try {
      const value = editValues[configKey];
      const { error } = await supabase
        .from("pricing_config")
        .update({ config_value: value, updated_at: new Date().toISOString() })
        .eq("config_key", configKey);

      if (error) throw error;
      toast({ title: "Saved!", description: `${configKey} updated successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updateJsonField = (configKey: string, field: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [configKey]: { ...prev[configKey], [field]: parseFloat(value) || 0 },
    }));
  };

  const updateSimpleValue = (configKey: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [configKey]: parseFloat(value) || 0,
    }));
  };

  if (loading) {
    return <div className="text-primary-foreground/50 text-center py-12">Loading pricing config…</div>;
  }

  const jsonConfigs = configs.filter((c) => typeof c.config_value === "object");
  const simpleConfigs = configs.filter((c) => typeof c.config_value !== "object");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-primary-foreground">Pricing Configuration</h2>
          <p className="text-xs text-primary-foreground/50">Adjust the premiums and rates used in price calculations.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchConfigs} className="text-primary-foreground/50 hover:text-gold">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Simple values */}
      <div className="grid sm:grid-cols-2 gap-4">
        {simpleConfigs.map((cfg) => (
          <Card key={cfg.config_key} className="bg-navy-light/10 border-navy-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-primary-foreground">{cfg.label || cfg.config_key}</CardTitle>
              {cfg.description && <CardDescription className="text-xs text-primary-foreground/40">{cfg.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                step="0.01"
                value={editValues[cfg.config_key] ?? ""}
                onChange={(e) => updateSimpleValue(cfg.config_key, e.target.value)}
                className="bg-navy-light/20 border-navy-light/30 text-primary-foreground"
              />
              <Button
                size="sm"
                onClick={() => handleSave(cfg.config_key)}
                disabled={saving === cfg.config_key}
                className="bg-gold text-navy hover:bg-gold-light"
              >
                {saving === cfg.config_key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                Save
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* JSON values (premiums) */}
      {jsonConfigs.map((cfg) => (
        <Card key={cfg.config_key} className="bg-navy-light/10 border-navy-light/20">
          <CardHeader>
            <CardTitle className="text-sm text-primary-foreground">{cfg.label || cfg.config_key}</CardTitle>
            {cfg.description && <CardDescription className="text-xs text-primary-foreground/40">{cfg.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(editValues[cfg.config_key] || {}).map(([field, val]) => (
                <div key={field}>
                  <Label className="text-xs text-primary-foreground/60">{field}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={val as number}
                    onChange={(e) => updateJsonField(cfg.config_key, field, e.target.value)}
                    className="bg-navy-light/20 border-navy-light/30 text-primary-foreground mt-1"
                  />
                </div>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => handleSave(cfg.config_key)}
              disabled={saving === cfg.config_key}
              className="bg-gold text-navy hover:bg-gold-light"
            >
              {saving === cfg.config_key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Save All
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Formula explanation */}
      <Card className="bg-navy-light/5 border-navy-light/15">
        <CardContent className="p-5">
          <p className="text-xs text-primary-foreground/40 font-mono">
            <strong className="text-primary-foreground/60">Formula:</strong>{" "}
            price = max( (passengers / max_capacity) × distance × base_rate × time_premium × journey_premium , distance × minimum_charge_per_mile )
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTab;
