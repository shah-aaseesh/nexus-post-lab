import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error: any) {
      toast.error("Failed to load podcasts");
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Podcasts</h1>
        <p className="text-muted-foreground">Listen to inspiring conversations and stories</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading podcasts...</p>
          </Card>
        ) : podcasts.length > 0 ? (
          podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(podcast.created_at), "MMMM dd, yyyy")}
                  </span>
                </div>
                <CardTitle className="text-2xl">{podcast.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {podcast.description && (
                  <p className="text-muted-foreground">{podcast.description}</p>
                )}
                
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(podcast.youtube_url)}
                    title={podcast.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {podcast.tags && podcast.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {podcast.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No podcasts available yet</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Podcasts;
