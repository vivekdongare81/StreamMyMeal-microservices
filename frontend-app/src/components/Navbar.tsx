import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems = 3; // Mock cart count

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-primary">FoodStream</span>
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
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItems}
                </Badge>
              )}
            </Button>
            
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button size="sm">
                Profile
              </Button>
            </Link>
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
              <div className="border-t pt-2 mt-2">
                <Link
                  to="/auth"
                  className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;