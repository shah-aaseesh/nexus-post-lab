import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Send } from "lucide-react";
import { ReactionPicker } from "@/components/ReactionPicker";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
      setupRealtimeSubscription();
    }
  }, [id]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `community_id=eq.${id}`
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchCommunityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
      const { data: commData, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCommunity(commData);

      if (user) {
        const { data: memberData } = await supabase
          .from("community_members")
          .select()
          .eq("community_id", id)
          .eq("user_id", user.id)
          .single();
        
        setIsMember(!!memberData);
      }

      await Promise.all([fetchPosts(), fetchMembers()]);
    } catch (error: any) {
      toast.error("Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase
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
        comments (count)
      `)
      .eq("community_id", id)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("community_members")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq("community_id", id)
      .limit(10);

    setMembers(data || []);
  };

  const handleJoinLeave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isMember) {
        await supabase
          .from("community_members")
          .delete()
          .eq("community_id", id)
          .eq("user_id", user.id);
        toast.success("Left community");
      } else {
        await supabase
          .from("community_members")
          .insert({ community_id: id, user_id: user.id });
        toast.success("Joined community!");
      }
      
      setIsMember(!isMember);
      fetchMembers();
    } catch (error: any) {
      toast.error("Action failed");
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("posts").insert({
        author_id: user.id,
        content: newPost,
        post_type: "text",
        community_id: id,
      });

      setNewPost("");
      toast.success("Post created!");
      fetchPosts();
    } catch (error: any) {
      toast.error("Failed to create post");
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existingReaction = posts
        .find(p => p.id === postId)
        ?.reactions?.find((r: any) => r.user_id === user.id);

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
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (!community) {
    return <div className="max-w-6xl mx-auto p-6">Community not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/communities")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Communities
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={community.avatar_url} />
                <AvatarFallback>
                  <Users className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                <p className="text-muted-foreground mb-2">{community.description}</p>
                <div className="flex gap-2">
                  {community.category && <Badge>{community.category}</Badge>}
                  {community.country && <Badge variant="outline">{community.country}</Badge>}
                </div>
              </div>
            </div>
            <Button onClick={handleJoinLeave}>
              {isMember ? "Leave" : "Join"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isMember && (
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Share something with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={handleCreatePost} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </CardContent>
            </Card>
          )}

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

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <ReactionPicker
                      onReact={(type) => handleReaction(post.id, type)}
                      currentReaction={userReaction?.reaction_type}
                      count={post.reactions?.length || 0}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {posts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. {isMember && "Be the first to share something!"}
              </p>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Members ({members.length})</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    to={`/profile/${member.profiles.username}`}
                    className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profiles.avatar_url} />
                      <AvatarFallback>{member.profiles.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{member.profiles.username}
                      </p>
                    </div>
                    {member.is_moderator && <Badge variant="secondary">Mod</Badge>}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
