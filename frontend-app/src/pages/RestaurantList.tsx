import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { RestaurantService, Restaurant } from "@/services";

const RestaurantList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const cuisines = ["All", "Indian", "Italian", "Japanese", "American", "Thai"];

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const searchQuery = searchParams.get('search');
        let data;
        
        if (searchQuery) {
          data = await RestaurantService.searchRestaurants(searchQuery);
          setSearchTerm(searchQuery);
        } else {
          data = await RestaurantService.getRestaurants();
        }
        
        setRestaurants(data);
      } catch (error) {
        console.error('Error loading restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [searchParams]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Restaurants Near You</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {cuisines.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className="whitespace-nowrap"
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Streaming Banner */}
        <div className="bg-gradient-hero rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Live Cooking Sessions</h2>
          <p className="mb-4">Watch your favorite chefs cook live and order the same dish!</p>
          <div className="flex gap-4 overflow-x-auto">
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

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-medium transition-shadow">
              <div className="relative">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                {restaurant.isLive && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <Play className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {restaurant.priceRange}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-food-warning text-food-warning" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3">{restaurant.cuisine}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {restaurant.deliveryTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {restaurant.location}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/menu/${restaurant.id}`}>
                      View Menu
                    </Link>
                  </Button>
                  {restaurant.isLive && (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/live/${restaurant.id}`}>
                        <Play className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;