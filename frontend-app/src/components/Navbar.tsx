import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CartService } from "@/services";
import { useAuth } from "@/lib/authContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const updateCartCount = () => {
      const items = CartService.getCartItems();
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(count);
    };

    updateCartCount();
    // Listen for storage changes (cart updates)
    window.addEventListener('storage', updateCartCount);
    // Custom event for cart updates within same tab
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleCartClick = () => {
    navigate('/checkout');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {/* Chef Hat and Moustache PNG Logo */}
            <span className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://www.svgheart.com/wp-content/uploads/2022/07/chef-hat-and-moustache_524-430-min.png"
                alt="Chef Hat Logo"
                className="w-8 h-8 object-contain"
                style={{ display: 'block' }}
              />
            </span>
            <span className="text-xl font-bold text-primary">StreamMyMeal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors hover:text-primary ${
                isActive("/") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/restaurants"
              className={`transition-colors hover:text-primary ${
                isActive("/restaurants") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Restaurants
            </Link>
            <Link
              to="/live"
              className={`transition-colors hover:text-primary ${
                location.pathname.startsWith("/live") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Live Cooking
            </Link>
            <Link
              to="/admin"
              className={`transition-colors hover:text-primary ${
                location.pathname.startsWith("/admin") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleCartClick}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button size="sm">Profile</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t bg-background/95 backdrop-blur-md p-4">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search restaurants, cuisines, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/restaurants"
                className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                to="/live"
                className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Live Cooking
              </Link>
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
                      onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;