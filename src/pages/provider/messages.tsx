import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send, Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';


interface Conversation {
  id: string;
  name: string;
  avatar: string;
  service_title: string;
  email: string;
}

const ProviderMessages = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

   
  const providerId = user?.id;



    const Backend_URL =
    import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://api.d0lt.local:5000";

  // 🧩 Fetch users with accepted/completed bookings
  useEffect(() => {
       if (!providerId) return;
    const fetchConversations = async () => {

      try {
        const res = await axios.get(`${Backend_URL}/api/messages/User-conversations`,{
          params: { providerId },
          
        });
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load conversations");
      }
    };
    fetchConversations();
  }, [providerId]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) {
      toast.error('Please select a conversation and type a message');
      return;
    }

    // Send message logic to backend (not implemented yet)
    toast.success('Message sent');
    setMessageInput('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages </h1>
        <p className="text-muted-foreground mt-1">
          Chat with customers who have accepted your services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Users List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Conversations </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedChat(user.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted border border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs opacity-75 truncate">{user.service_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg">
                  {users.find((u) => u.id === selectedChat)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Chat messages will go here */}
                <div className="flex-1 overflow-y-auto flex items-center justify-center text-muted-foreground">
                  Start messaging with {users.find((u) => u.id === selectedChat)?.name}
                </div>

                <div className="flex gap-2 border-t border-border pt-4">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProviderMessages;
