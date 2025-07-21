import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Users, ShoppingCart, Star, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { RestaurantService, LiveStreamService, Restaurant, LiveStream, LiveRestaurant } from "@/services";
import { restaurantsData } from "../data/restaurants";
import { liveStreamsData } from '../data/liveStreams';
import io from 'socket.io-client';

const SFU_URL = 'http://localhost:4000';
const socket = io(SFU_URL, { autoConnect: true });
// @ts-ignore
(window as any).socket = socket; // for manual testing in browser console

interface LiveStreamData {
  id: string;
  restaurantName: string;
  chefName: string;
  dishName: string;
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
  const [previewStream, setPreviewStream] = useState<LiveStream | null>(null);
  const [otherStreams, setOtherStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showLiveViewer, setShowLiveViewer] = useState(false);
  const [isBroadcastLive, setIsBroadcastLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Add a useEffect to poll viewer count via socket.io
  useEffect(() => {
    if (!previewStream?.id) return;

    const emitViewerCount = () => {
      socket.emit('get-viewer-count', previewStream.id, (count) => {
        console.log('Live viewers for', previewStream.id, ':', count);
        setViewerCount(count);
      });
    };

    // Poll every 3 seconds
    const interval = setInterval(() => {
      if (socket.connected) emitViewerCount();
    }, 3000);

    // Fetch immediately on mount
    if (socket.connected) emitViewerCount();
    else socket.once('connect', emitViewerCount);

    return () => {
      clearInterval(interval);
      socket.off('connect', emitViewerCount);
    };
  }, [previewStream?.id]);

  useEffect(() => {
  const fetchLiveRestaurants = async () => {
      setLoading(true);
      try {
      const liveRestaurants = await LiveStreamService.getLiveRestaurants();
        // Convert LiveRestaurant to LiveStream format for the UI
        const convertedStreams: LiveStream[] = liveRestaurants.map(restaurant => ({
          id: restaurant.liveSession.broadcastId,
          restaurantId: restaurant.restaurantId.toString(),
          title: `${restaurant.name} - Live Cooking Session`,
          viewers: restaurant.liveSession.viewersCount,
          viewersCount: restaurant.liveSession.viewersCount,
          isLive: restaurant.liveSession.isLive,
          image: restaurant.image,
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          chatMessages: [
            { id: "1", user: "FoodLover123", message: "Looks amazing! 😍", timestamp: new Date() },
            { id: "2", user: "Chef_Fan", message: "What spices are you using?", timestamp: new Date() },
            { id: "3", user: "Hungry_User", message: "Can't wait to order this!", timestamp: new Date() }
          ]
        }));
        let stream: LiveStream | undefined;
        if (restaurantId) {
          stream = convertedStreams.find(
          r => String(r.restaurantId) === String(restaurantId)
        );
        } else {
          stream = convertedStreams[0]; // Pick the first live stream as default
        }
        if (stream) {
          setPreviewStream(stream);
      } else {
          setPreviewStream(null);
        }
        setOtherStreams(convertedStreams.filter(
          r => stream ? String(r.restaurantId) !== String(stream!.restaurantId) : true
        ));
        setError(null);
    } catch (err) {
      setError('Failed to fetch live restaurants');
        setPreviewStream(null);
        setOtherStreams([]);
    } finally {
      setLoading(false);
    }
  };
    fetchLiveRestaurants();
  }, [restaurantId]);
  
// Main func after relaod
  useEffect(() => {
    if (!previewStream?.id) return;

    const emitCheck = () => {
      socket.emit('check-broadcast-exists', previewStream.id, (exists) => {
        console.log("Socket callback fired for", previewStream.id, "exists:", exists);
        if (exists) {
          setIsBroadcastLive(true);
          console.log(`Broadcast exists for broadcastId: ${previewStream.id}`);
        } else {
          setIsBroadcastLive(false);
          console.log(`Broadcast not exist for broadcastId: ${previewStream.id}`);
        }
      });
    };

    if (socket.connected) {
      emitCheck();
    } else {
      socket.once('connect', emitCheck);
    }

    // Cleanup: remove listener if component unmounts before connect
    return () => {
      socket.off('connect', emitCheck);
    };
  }, [previewStream?.id]);

  const handleBroadcastClick = () => {
    if (previewStream?.id) {
      window.open(`http://localhost:8080/broadcaster?broadcastId=${previewStream.id}`, '_blank');
      setIsBroadcastLive(true);
    }
  };

  const handleCardClick = (stream: LiveStream) => {
    if (!previewStream) return;
    // Move current preview to cards, and clicked card to preview
    setOtherStreams(prev => [previewStream!, ...prev.filter(s => s.id !== stream.id)]);
    
    // Set the dummy video URL for the clicked stream and reset chat
    const streamWithVideo = {
      ...stream,
      streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      chatMessages: [
        { id: "1", user: "FoodLover123", message: "Looks amazing! 😍", timestamp: new Date() },
        { id: "2", user: "Chef_Fan", message: "What spices are you using?", timestamp: new Date() },
        { id: "3", user: "Hungry_User", message: "Can't wait to order this!", timestamp: new Date() }
      ]
    };
    
    setPreviewStream(streamWithVideo);
    
    // Restart video by forcing a reload
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {
          // console.log('Video autoplay prevented');
        });
      }
    }, 100);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !previewStream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!previewStream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">No Live Streams</div>
          <p className="text-gray-400">No restaurants are currently live streaming</p>
        </div>
      </div>
    );
  }

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
                  onClick={handleBroadcastClick}
                  className="absolute top-4 right-4 z-20 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded shadow-lg transition-all duration-200 animate-glare transform hover:scale-110"
                  style={{ minWidth: 140, fontSize: '0.95rem' }}
                >
                  Broadcast My Restaurant
                </button>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'black' }}>
                  {isBroadcastLive && previewStream?.id ? (
                    <iframe
                      src={`http://localhost:8080/viewer?broadcastId=${previewStream.id}`}
                      title="Live Stream Viewer"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                        background: '#000',
                      }}
                    />
                  ) : (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  )}
                  </div>
                {/* Live Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    {isBroadcastLive ? `${viewerCount} viewers` : 'Demo'}
                    </Badge>
                  </div>
                {/* Stream Stats */}
                <div className="absolute top-4 right-4 flex gap-2">
                   <span className="bg-black/50 text-white px-3 py-1 text-xs font-semibold">
                      <Users className="w-3 h-3 mr-1 inline" />
                      {previewStream?.viewersCount || previewStream?.viewers || 0} viewers
                    </span>
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
                    {previewStream && (
                      <button
                        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold"
                        onClick={() => {
                          window.location.href = `/menu/${previewStream.restaurantId}`;
                        }}
                      >
                        Order Now
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {viewerCount} viewers
                    </Badge>
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
              {/* Chat Input Section */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newMessage = {
                          id: Date.now().toString(),
                          user: "You",
                          message: e.currentTarget.value.trim(),
                          timestamp: new Date()
                        };
                        if (previewStream) {
                          const updatedStream = {
                            ...previewStream,
                            chatMessages: [...(previewStream.chatMessages || []), newMessage]
                          };
                          setPreviewStream(updatedStream);
                        }
                        e.currentTarget.value = '';
                        // Scroll to bottom
                        setTimeout(() => {
                          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const newMessage = {
                          id: Date.now().toString(),
                          user: "You",
                          message: input.value.trim(),
                          timestamp: new Date()
                        };
                        if (previewStream) {
                          const updatedStream = {
                            ...previewStream,
                            chatMessages: [...(previewStream.chatMessages || []), newMessage]
                          };
                          setPreviewStream(updatedStream);
                        }
                        input.value = '';
                        // Scroll to bottom
                        setTimeout(() => {
                          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                  >
                    Send
                  </Button>
                </div>
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
                      src={stream.image || "https://via.placeholder.com/300x200?text=No+Image"}
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
                        {stream.viewersCount || stream.viewers}
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