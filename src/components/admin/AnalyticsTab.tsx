import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Enquiry {
  id: string;
  created_at: string;
  journey_type: string | null;
  status: string;
  estimated_price: number | null;
  payment_status: string | null;
}

const COLORS = ["hsl(168, 32%, 45%)", "hsl(210, 12%, 40%)", "hsl(168, 36%, 52%)", "hsl(210, 8%, 26%)", "hsl(168, 34%, 35%)", "hsl(210, 10%, 30%)"];

const AnalyticsTab = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("enquiries")
      .select("id, created_at, journey_type, status, estimated_price, payment_status")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setEnquiries(data as Enquiry[]);
        setLoading(false);
      });
  }, []);

  const enquiriesOverTime = useMemo(() => {
    const byDay: Record<string, number> = {};
    enquiries.forEach((e) => {
      const day = new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay).map(([date, count]) => ({ date, count }));
  }, [enquiries]);

  const journeyTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    enquiries.forEach((e) => {
      const type = e.journey_type || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enquiries]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    enquiries.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enquiries]);

  const totalRevenue = useMemo(() => {
    return enquiries
      .filter((e) => e.payment_status === "paid" && e.estimated_price)
      .reduce((sum, e) => sum + (e.estimated_price || 0), 0);
  }, [enquiries]);

  const conversionRate = useMemo(() => {
    if (!enquiries.length) return 0;
    const confirmed = enquiries.filter((e) => e.status === "confirmed" || e.payment_status === "paid").length;
    return Math.round((confirmed / enquiries.length) * 100);
  }, [enquiries]);

  if (loading) {
    return <div className="text-primary-foreground/50 text-center py-12">Loading analytics…</div>;
  }

  const chartConfig = {
    count: { label: "Enquiries", color: "hsl(168, 32%, 45%)" },
    value: { label: "Count", color: "hsl(168, 32%, 45%)" },
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Enquiries", value: enquiries.length },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Revenue (Paid)", value: `£${totalRevenue.toFixed(0)}` },
          { label: "Avg. Price", value: `£${enquiries.length ? (enquiries.reduce((s, e) => s + (e.estimated_price || 0), 0) / enquiries.filter((e) => e.estimated_price).length || 0).toFixed(0) : 0}` },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-navy-light/20 border-navy-light/30">
            <CardContent className="p-4">
              <p className="text-xs text-primary-foreground/50">{kpi.label}</p>
              <p className="text-2xl font-bold text-gold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enquiries over time */}
      <Card className="bg-navy-light/10 border-navy-light/20">
        <CardHeader>
          <CardTitle className="text-primary-foreground text-sm">Enquiries Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={enquiriesOverTime}>
              <XAxis dataKey="date" tick={{ fill: "hsl(0,0%,70%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(0,0%,70%)", fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(168, 32%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Journey type breakdown */}
        <Card className="bg-navy-light/10 border-navy-light/20">
          <CardHeader>
            <CardTitle className="text-primary-foreground text-sm">By Journey Type</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[220px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={journeyTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {journeyTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="bg-navy-light/10 border-navy-light/20">
          <CardHeader>
            <CardTitle className="text-primary-foreground text-sm">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" tick={{ fill: "hsl(0,0%,70%)", fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "hsl(0,0%,70%)", fontSize: 11 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(168, 36%, 52%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
