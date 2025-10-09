import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Blogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blogs</h1>
        <p className="text-muted-foreground">Read stories and insights from students around the world</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card className="col-span-full p-12 text-center">
            <p className="text-muted-foreground">Loading blogs...</p>
          </Card>
        ) : blogs.length > 0 ? (
          blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {blog.cover_image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                {blog.category && (
                  <Badge className="mb-2 w-fit">{blog.category}</Badge>
                )}
                <CardTitle className="text-xl line-clamp-2">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {blog.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${blog.profiles.username}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={blog.profiles.avatar_url} />
                      <AvatarFallback>{blog.profiles.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/profile/${blog.profiles.username}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {blog.profiles.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(blog.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {blog.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No blogs published yet</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Blogs;
