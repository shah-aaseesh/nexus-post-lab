import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, School, Award, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: postsData } = await supabase
        .from("posts")
        .select("*, reactions(count), comments(count)")
        .eq("author_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setPosts(postsData || []);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="animate-pulse">
          <CardHeader className="h-48 bg-muted" />
          <CardContent className="space-y-4 pt-6">
            <div className="h-24 w-24 rounded-full bg-muted -mt-20" />
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="h-48 bg-gradient-to-r from-primary to-secondary rounded-t-xl" />
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background -mt-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">{profile.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-4">
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            <Button>Follow</Button>
          </div>

          {profile.bio && <p className="text-lg">{profile.bio}</p>}

          <div className="flex flex-wrap gap-4">
            {profile.school && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <School className="h-4 w-4" />
                <span>{profile.school}</span>
              </div>
            )}
            {profile.country && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.country}</span>
              </div>
            )}
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, i: number) => (
                <Badge key={i} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {profile.achievements && profile.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </h3>
              <div className="space-y-1">
                {profile.achievements.map((achievement: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">• {achievement}</p>
                ))}
              </div>
            </div>
          )}

          {profile.social_links && (
            <div className="flex gap-3">
              {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => (
                url && (
                  <Button key={platform} variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {platform}
                    </a>
                  </Button>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Posts</h2>
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap mb-4">{post.content}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{post.reactions?.[0]?.count || 0} reactions</span>
                <span>{post.comments?.[0]?.count || 0} comments</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
