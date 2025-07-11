import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { DataService, Restaurant } from "@/services/dataService";

const Index = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [liveRestaurants, setLiveRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, live] = await Promise.all([
          DataService.getFeaturedRestaurants(),
          DataService.getLiveRestaurants()
        ]);
        setFeaturedRestaurants(featured);
        setLiveRestaurants(live);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Order Food & Watch Live Cooking</h1>
          <p className="text-xl mb-8 opacity-90">Discover restaurants, watch chefs cook live, and get fresh food delivered</p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input placeholder="Search restaurants or cuisines..." className="pl-12 h-12 text-foreground" />
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/live/1">Watch Live Cooking</Link>
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
              // Loading skeleton
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
              liveRestaurants.map((restaurant) => (
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
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Restaurants</h2>
            <p className="text-muted-foreground">Top-rated restaurants in your area</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
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
        </div>
      </section>
    </div>
  );
};

export default Index;
