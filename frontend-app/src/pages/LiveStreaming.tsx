import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Users, ShoppingCart, Star, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { RestaurantService, LiveStreamService, Restaurant, LiveStream } from "@/services";
import { restaurantsData } from "../data/restaurants";

interface LiveStreamData {
  id: string;
  restaurantName: string;
  chefName: string;
  dishName: string;
  viewers: number;
  likes: number;
  duration: string;
  isLive: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

const mockStreamData: LiveStreamData = {
  id: "1",
  restaurantName: "Spice Garden",
  chefName: "Chef Rahul",
  dishName: "Butter Chicken with Naan",
  viewers: 156,
  likes: 89,
  duration: "15:30",
  isLive: true
};

const mockMessages: ChatMessage[] = [
  { id: "1", username: "FoodLover23", message: "This looks amazing! 😍", timestamp: "2 min ago" },
  { id: "2", username: "SpiceQueen", message: "What's the secret ingredient?", timestamp: "3 min ago" },
  { id: "3", username: "ChefFan", message: "I'm definitely ordering this!", timestamp: "5 min ago" },
  { id: "4", username: "Hungry_Soul", message: "Can you show the spice mix again?", timestamp: "7 min ago" },
];

const LiveStreaming = () => {
  const { restaurantId } = useParams();
  const [isPlaying, setIsPlaying] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [allLiveStreams, setAllLiveStreams] = useState<LiveStream[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allStreams] = await Promise.all([
          LiveStreamService.getAllLiveStreams()
        ]);
        setAllLiveStreams(allStreams);

        if (!restaurantId) {
          // If no restaurantId, show first live restaurant
          const liveRestaurants = await RestaurantService.getLiveRestaurants();
          if (liveRestaurants.length > 0) {
            const firstLive = liveRestaurants[0];
            setRestaurant(firstLive);
            const stream = await LiveStreamService.getLiveStreamByRestaurantId(firstLive.id);
            setLiveStream(stream);
          }
        } else {
          const [restaurantData, streamData] = await Promise.all([
            RestaurantService.getRestaurantById(restaurantId),
            LiveStreamService.getLiveStreamByRestaurantId(restaurantId)
          ]);
          setRestaurant(restaurantData);
          setLiveStream(streamData);
        }
      } catch (error) {
        console.error('Error loading live stream data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [likes, setLikes] = useState(mockStreamData.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate new messages
    const interval = setInterval(() => {
      const randomMessages = [
        "This technique is incredible!",
        "I can smell it from here 😂",
        "Adding this to my order right now",
        "Chef, you're amazing!",
        "Best cooking stream ever!"
      ];
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        username: `User${Math.floor(Math.random() * 1000)}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: "just now"
      };
      
      setMessages(prev => [...prev, newMsg].slice(-50)); // Keep last 50 messages
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: "You",
        message: newMessage,
        timestamp: "just now"
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                {/* Video Player */}
                {liveStream?.streamUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    src={liveStream.streamUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                      </div>
                      <p className="text-sm">Loading live stream...</p>
                    </div>
                  </div>
                )}
                
                {/* Live Badge */}
                {liveStream?.isLive && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                      LIVE
                    </Badge>
                  </div>
                )}
                
                {/* Stream Stats */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    {liveStream?.viewers || 0}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    15:30
                  </Badge>
                </div>
                
                {/* Play/Pause Overlay */}
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20"
                >
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                  </div>
                </button>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{liveStream?.title || "Live Cooking Session"}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{restaurant?.name}</span>
                      <span>•</span>
                      <span>Chef Live</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleLike}>
                      <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link to={`/menu/${restaurantId}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order This Dish
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/menu/${restaurantId}`}>
                      View Menu
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat ({liveStream?.viewers || 0} viewers)
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {liveStream?.chatMessages?.map((message) => (
                  <div key={message.id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {message.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-primary">
                          {message.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {message.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-primary">
                          {message.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Other Live Streams */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Other Live Cooking Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allLiveStreams
              .filter(stream => stream.restaurantId !== restaurantId)
              .map((stream) => {
                const restaurant = restaurantsData.find(r => r.id === stream.restaurantId);
                return (
                  <Link key={stream.id} to={`/live/${stream.restaurantId}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img
                          src={restaurant?.image || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={stream.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-500 text-white animate-pulse text-xs">
                            <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
                            LIVE
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                            <Users className="w-2 h-2 mr-1" />
                            {stream.viewers}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium mb-1 text-sm line-clamp-2">{stream.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Live now</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-food-warning text-food-warning" />
                            <span className="text-xs">4.5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;