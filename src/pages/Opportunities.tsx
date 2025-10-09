import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Calendar, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  const fetchOpportunities = async () => {
    try {
      let query = supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("opportunity_type", filter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      scholarship: "bg-primary text-primary-foreground",
      competition: "bg-accent text-accent-foreground",
      internship: "bg-secondary text-secondary-foreground",
      event: "bg-purple-500 text-white",
      fellowship: "bg-pink-500 text-white",
    };
    return colors[type] || "bg-muted";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Opportunities</h1>
        <p className="text-muted-foreground">Discover scholarships, competitions, internships, and more</p>
      </div>

      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opportunities</SelectItem>
            <SelectItem value="scholarship">Scholarships</SelectItem>
            <SelectItem value="competition">Competitions</SelectItem>
            <SelectItem value="internship">Internships</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="fellowship">Fellowships</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading opportunities...</p>
          </Card>
        ) : opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <Badge className={getTypeColor(opp.opportunity_type)}>
                        {opp.opportunity_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{opp.title}</CardTitle>
                  </div>
                  {opp.apply_url && (
                    <Button asChild>
                      <a href={opp.apply_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{opp.description}</p>
                
                {opp.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {format(new Date(opp.deadline), "MMMM dd, yyyy")}</span>
                  </div>
                )}

                {opp.tags && opp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {opp.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No opportunities found</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
