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
import { liveStreamsData } from '../data/liveStreams';

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
  // Remove useParams and all API/dynamic loading
  // const { restaurantId } = useParams();
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewStream, setPreviewStream] = useState<LiveStream | null>(null);
  const [otherStreams, setOtherStreams] = useState<LiveStream[]>([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On mount, set the first stream as preview, rest as cards
    const streams = Object.values(liveStreamsData);
    if (streams.length > 0) {
      setPreviewStream(streams[0]);
      setLikes(streams[0].viewers || 0);
      setOtherStreams(streams.slice(1));
    }
  }, []);

  const handleCardClick = (stream: LiveStream) => {
    if (!previewStream) return;
    // Move current preview to cards, and clicked card to preview
    setOtherStreams(prev => [previewStream!, ...prev.filter(s => s.id !== stream.id)]);
    setPreviewStream(stream);
    setLikes(stream.viewers || 0);
    setHasLiked(false);
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

  if (!previewStream) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                {/* Broadcast My Restaurant Button */}
                <button
                  onClick={() => alert('Broadcast My Restaurant clicked!')}
                  className="absolute top-4 right-4 z-20 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded shadow-lg transition-all duration-200 animate-glare transform hover:scale-110"
                  style={{ minWidth: 140, fontSize: '0.95rem' }}
                >
                  Broadcast My Restaurant
                </button>
                {/* Video Player */}
                {previewStream?.streamUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    src={previewStream.streamUrl}
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
                {previewStream?.isLive && (
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
                    {previewStream?.viewers || 0}
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
                    <h1 className="text-2xl font-bold mb-2">{previewStream?.title || "Live Cooking Session"}</h1>
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
              </CardContent>
            </Card>
          </div>
          {/* Chat Section (optional, can be left as is or removed for dummy demo) */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {previewStream?.chatMessages?.map((message) => (
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
                          {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : String(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </Card>
          </div>
        </div>
        {/* Other Live Streams as Cards */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Other Live Cooking Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherStreams.map((stream) => (
              <div key={stream.id} onClick={() => handleCardClick(stream)} className="cursor-pointer">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={restaurantsData.find(r => r.id === stream.restaurantId)?.image || "https://via.placeholder.com/300x200?text=No+Image"}
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
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;