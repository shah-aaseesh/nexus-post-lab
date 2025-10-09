import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chat</h1>
        <p className="text-muted-foreground">Connect with friends and communities</p>
      </div>

      <Card className="p-12 text-center">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
        <CardTitle className="mb-2">Chat Feature Coming Soon</CardTitle>
        <p className="text-muted-foreground">
          Real-time messaging with 1-on-1 and group chats will be available soon!
        </p>
      </Card>
    </div>
  );
};

export default Chat;
