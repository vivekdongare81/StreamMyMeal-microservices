import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Play, Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { restaurantsData } from '../data/restaurants';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { RestaurantService, Restaurant } from "@/services";
import { LiveStreamService } from "@/services/liveStreamService";
import CuisinePosters from "../components/CuisinePosters";

const Index = () => {
  const restaurants = restaurantsData;
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [liveRestaurants, setLiveRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const featured = await RestaurantService.getFeaturedRestaurants();
        setFeaturedRestaurants(featured);
        // Fetch all live restaurants from live-streaming API and take top 3
        const allLive = await LiveStreamService.getLiveRestaurants();
        const normalized = allLive.map(r => ({
          ...r,
          id: r.restaurantId || r.id
        }));
        setLiveRestaurants(normalized.slice(0, 3));
      } catch (error) {
        setLiveRestaurants([]);
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-4xl">🍳</div>
            <h1 className="text-5xl font-bold">Order Food & Watch Live Cooking</h1>
            <div className="text-4xl">🥘</div>
          </div>
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="text-2xl">✨</div>
            <p className="text-xl opacity-90">See your food being prepared fresh - ensuring hygiene & quality you can trust</p>
            <div className="text-2xl">🧼</div>
          </div>
          <div className="flex justify-center items-center gap-4 text-sm opacity-80 mb-8">
            <span className="flex items-center gap-2">
              <div className="text-green-400">🛡️</div>
              Hygiene Verified
            </span>
            <span className="flex items-center gap-2">
              <div className="text-blue-400">👁️</div>
              Live Transparency
            </span>
            <span className="flex items-center gap-2">
              <div className="text-yellow-400">⭐</div>
              Quality Assured
            </span>
          </div>
          
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search restaurants or cuisines..."
                  className="pl-12 h-12 text-foreground"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white text-black border-white/50 hover:bg-gray-100 hover:border-black">
              <Link to="/live/1">
                <span className="text-black">Watch Live Cooking</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

        {/* Live Streaming Banner */}
        <div className="bg-gradient-hero rounded-lg p-6 gap-4 mx-5 mb-6 text-white mt-12">
          <h2 className="text-2xl font-bold mb-2">Live Cooking Sessions</h2>
          <p className="mb-4">Watch your favorite chefs cook live and order the same dish!</p>
          <div className="flex gap-8 overflow-x-auto">
            {restaurants.filter(r => r.isLive).map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/live/${restaurant.id}`}
                className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-lg p-3 hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Play className="w-4 h-4" />
                  <span className="font-medium">{restaurant.name}</span>
                  <Badge variant="secondary" className="bg-red-500 text-white">
                    {restaurant.viewers} watching
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

      {/* Cuisine Posters Section */}
      <CuisinePosters />

      <div className="flex justify-center mb-8">
        <Button asChild variant="outline" size="lg">
          <Link to="/admin">Go to Admin Panel</Link>
        </Button>
      </div>

      {/* Featured Restaurants */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Restaurants</h2>
            <p className="text-muted-foreground">Top-rated restaurants in your area</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRestaurants.slice(0, 3).map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-food-warning text-food-warning" />
                      <span className="text-sm">{restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{restaurant.cuisine}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {restaurant.deliveryTime}
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/menu/${restaurant.id}`}>Order Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/restaurants">View All Restaurants</Link>
            </Button>
          </div>
        </div>
      </section>



      {/* Live Cooking Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Cooking Sessions</h2>
            <p className="text-muted-foreground">Watch your favorite chefs cook in real-time</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              liveRestaurants.slice(0, 3).map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                  <div className="relative">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
                      <Play className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                    <p className="text-muted-foreground mb-3">{restaurant.cuisine}</p>
                    {restaurant.viewers && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {restaurant.viewers} viewers watching
                      </p>
                    )}
                    <Button asChild className="w-full">
                      <Link to={`/live/${restaurant.id}`}>Watch Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/live">View All Live Streams</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
