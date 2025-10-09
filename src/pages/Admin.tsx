import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Briefcase, BookOpen, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!data) {
        toast.error("You don't have admin access");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const [oppForm, setOppForm] = useState({
    title: "",
    description: "",
    opportunity_type: "scholarship",
    deadline: "",
    apply_url: "",
    tags: "",
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    published: false,
  });

  const [podcastForm, setPodcastForm] = useState({
    title: "",
    description: "",
    youtube_url: "",
    tags: "",
  });

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("opportunities").insert([{
        title: oppForm.title,
        description: oppForm.description,
        opportunity_type: oppForm.opportunity_type as any,
        deadline: oppForm.deadline || null,
        apply_url: oppForm.apply_url || null,
        tags: oppForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        created_by: user.id,
      }]);

      toast.success("Opportunity created!");
      setOppForm({
        title: "",
        description: "",
        opportunity_type: "scholarship",
        deadline: "",
        apply_url: "",
        tags: "",
      });
    } catch (error: any) {
      toast.error("Failed to create opportunity");
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("blogs").insert({
        ...blogForm,
        tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        author_id: user.id,
      });

      toast.success("Blog created!");
      setBlogForm({
        title: "",
        content: "",
        category: "",
        tags: "",
        published: false,
      });
    } catch (error: any) {
      toast.error("Failed to create blog");
    }
  };

  const handleCreatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("podcasts").insert({
        ...podcastForm,
        tags: podcastForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        created_by: user.id,
      });

      toast.success("Podcast created!");
      setPodcastForm({
        title: "",
        description: "",
        youtube_url: "",
        tags: "",
      });
    } catch (error: any) {
      toast.error("Failed to create podcast");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage content and users</p>
        </div>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Create Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOpportunity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="opp-title">Title</Label>
                  <Input
                    id="opp-title"
                    value={oppForm.title}
                    onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opp-type">Type</Label>
                  <Select
                    value={oppForm.opportunity_type}
                    onValueChange={(value) => setOppForm({ ...oppForm, opportunity_type: value })}
                  >
                    <SelectTrigger id="opp-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opp-description">Description</Label>
                  <Textarea
                    id="opp-description"
                    value={oppForm.description}
                    onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opp-deadline">Deadline</Label>
                    <Input
                      id="opp-deadline"
                      type="date"
                      value={oppForm.deadline}
                      onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp-url">Apply URL</Label>
                    <Input
                      id="opp-url"
                      type="url"
                      value={oppForm.apply_url}
                      onChange={(e) => setOppForm({ ...oppForm, apply_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opp-tags">Tags (comma-separated)</Label>
                  <Input
                    id="opp-tags"
                    value={oppForm.tags}
                    onChange={(e) => setOppForm({ ...oppForm, tags: e.target.value })}
                    placeholder="Engineering, International, Full-ride"
                  />
                </div>
                <Button type="submit">Create Opportunity</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Create Blog Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Title</Label>
                  <Input
                    id="blog-title"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-category">Category</Label>
                  <Input
                    id="blog-category"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    required
                    rows={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                  <Input
                    id="blog-tags"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    placeholder="Study Tips, College Life, International"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="blog-published"
                    checked={blogForm.published}
                    onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="blog-published">Publish immediately</Label>
                </div>
                <Button type="submit">Create Blog</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="podcasts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Add Podcast Episode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePodcast} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="podcast-title">Title</Label>
                  <Input
                    id="podcast-title"
                    value={podcastForm.title}
                    onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-url">YouTube URL</Label>
                  <Input
                    id="podcast-url"
                    type="url"
                    value={podcastForm.youtube_url}
                    onChange={(e) => setPodcastForm({ ...podcastForm, youtube_url: e.target.value })}
                    required
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-description">Description</Label>
                  <Textarea
                    id="podcast-description"
                    value={podcastForm.description}
                    onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-tags">Tags (comma-separated)</Label>
                  <Input
                    id="podcast-tags"
                    value={podcastForm.tags}
                    onChange={(e) => setPodcastForm({ ...podcastForm, tags: e.target.value })}
                    placeholder="Career, Interview, Success Story"
                  />
                </div>
                <Button type="submit">Add Podcast</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
