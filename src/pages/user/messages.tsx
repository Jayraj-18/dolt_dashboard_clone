import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { mockMessages, mockProviders } from '../../lib/mockData';
import { Send, Search, MessageSquare } from 'lucide-react';
import { formatDistance } from 'date-fns';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>('user_prov_1');
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState(mockMessages);

  const userMessages = allMessages;
  const providers = mockProviders.slice(0, 3);

  const getConversationMessages = (conversationId: string) => {
    return userMessages.filter(
      (m) => (m.senderId === conversationId || m.receiverId === conversationId)
    );
  };

  const getConversationParticipant = (conversationId: string) => {
    const senderId = userMessages.find((m) => m.receiverId === 'user_1')?.senderId;
    return senderId === conversationId ? conversationId : conversationId;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'user_1',
        receiverId: selectedConversation,
        content: messageText,
        timestamp: new Date(),
        read: false,
        senderName: 'You',
        senderAvatar: 'https://avatar.vercel.sh/you',
      };
      setAllMessages([...allMessages, newMessage]);
      setMessageText('');
    }
  };

  const conversationMessages = getConversationMessages(selectedConversation);
  const unreadCount = allMessages.filter((m) => !m.read && m.receiverId === 'user_1').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Chat with service providers and manage conversations
        </p>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {providers.map((provider) => {
              const lastMessage = getConversationMessages(provider.id).pop();
              const hasUnread = allMessages.some(
                (m) => m.senderId === provider.id && !m.read && m.receiverId === 'user_1'
              );

              return (
                <div
                  key={provider.id}
                  onClick={() => setSelectedConversation(provider.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === provider.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{provider.name}</p>
                      {lastMessage && (
                        <p className="text-xs opacity-75 truncate">{lastMessage.content}</p>
                      )}
                    </div>
                    {hasUnread && (
                      <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={mockProviders.find((p) => p.id === selectedConversation)?.avatar}
                  alt="Provider"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {mockProviders.find((p) => p.id === selectedConversation)?.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Messages Container */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationMessages.length > 0 ? (
              conversationMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderId === 'user_1' ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div
                    className={`flex-1 ${
                      msg.senderId === 'user_1' ? 'flex flex-col items-end' : ''
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${
                        msg.senderId === 'user_1'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistance(msg.timestamp, new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button size="icon" type="submit">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Message Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pro Tip:</span> Use clear and concise messages to communicate with providers. You can also attach files for reference.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
