import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";

const Communities = () => {
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [allCommunities, setAllCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's communities
      const { data: myComms } = await supabase
        .from("community_members")
        .select("communities(*), joined_at")
        .eq("user_id", user.id);

      // Fetch all communities
      const { data: allComms } = await supabase
        .from("communities")
        .select("*, community_members(count)");

      setMyCommunities(myComms?.map(m => m.communities) || []);
      setAllCommunities(allComms || []);
    } catch (error: any) {
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: user.id,
      });

      toast.success("Joined community!");
      fetchCommunities();
    } catch (error: any) {
      toast.error("Failed to join community");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Communities</h1>
        <p className="text-muted-foreground">Connect with like-minded students</p>
      </div>

      <Tabs defaultValue="my" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my">My Communities</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : myCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={community.avatar_url} />
                      <AvatarFallback>
                        <Users className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{community.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {community.description}
                    </p>
                    <Button variant="outline" className="w-full">View</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't joined any communities yet</p>
              <Button onClick={() => document.querySelector('[value="discover"]')?.dispatchEvent(new Event('click'))}>
                Discover Communities
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCommunities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={community.avatar_url} />
                    <AvatarFallback>
                      <Users className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{community.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {community.community_members?.[0]?.count || 0} members
                    </span>
                    <Button size="sm" onClick={() => joinCommunity(community.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communities;
