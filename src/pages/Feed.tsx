import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2, Bookmark } from "lucide-react";
import { ReactionPicker } from "@/components/ReactionPicker";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
    setupRealtimeSubscription();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions'
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            username,
            avatar_url
          ),
          reactions (
            id,
            reaction_type,
            user_id
          ),
          comments (count),
          shares (count)
        `)
        .is('community_id', null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const post = posts.find(p => p.id === postId);
      const existingReaction = post?.reactions?.find((r: any) => r.user_id === user.id);

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase.from("reactions").delete().eq("id", existingReaction.id);
        } else {
          await supabase
            .from("reactions")
            .update({ reaction_type: reactionType as any })
            .eq("id", existingReaction.id);
        }
      } else {
        await supabase.from("reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType as any,
        });
      }

      fetchPosts();
    } catch (error: any) {
      toast.error("Failed to react");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-4 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Feed</h1>
        <p className="text-muted-foreground">See what's happening in the community</p>
      </div>

      {posts.map((post) => {
        const userReaction = post.reactions?.find((r: any) => r.user_id === currentUserId);
        
        return (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Link to={`/profile/${post.profiles.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.profiles.avatar_url} />
                    <AvatarFallback>{post.profiles.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/profile/${post.profiles.username}`}
                    className="font-semibold hover:underline"
                  >
                    {post.profiles.full_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{post.profiles.username} •{" "}
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
              
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.media_urls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt="Post media"
                      className="rounded-lg w-full object-cover max-h-64"
                    />
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t">
                <ReactionPicker
                  onReact={(type) => handleReaction(post.id, type)}
                  currentReaction={userReaction?.reaction_type}
                  count={post.reactions?.length || 0}
                />
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments?.[0]?.count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares?.[0]?.count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {posts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </Card>
      )}
    </div>
  );
};

export default Feed;
