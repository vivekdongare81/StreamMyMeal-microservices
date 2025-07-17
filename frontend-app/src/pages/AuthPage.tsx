import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { userService } from "@/services";
import { devLog, devError } from "@/lib/logger";
import { useAuth } from "@/lib/authContext";

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupName, setSignupName] = useState("Admin");
  const [signupEmail, setSignupEmail] = useState("admin@streammymeal.com");
  const [signupPassword, setSignupPassword] = useState("admin123");
  const [signupAddress, setSignupAddress] = useState("");
  const [signinEmail, setSigninEmail] = useState("admin@streammymeal.com");
  const [signinPassword, setSigninPassword] = useState("admin123");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    devLog(`[Auth] Trying to log in as: ${signinEmail}`);
    try {
      const res = await userService.login({ email: signinEmail, password: signinPassword });
      await login(res.token); // update context and profile immediately
      devLog(`[Auth] Login successful! User data:`, res);
      toast.success("Welcome back!");
      navigate('/restaurants');
      devLog('[Auth] Redirected to /restaurants after login');
    } catch (err: any) {
      devError(`[Auth] Login failed for ${signinEmail}:`, err);
      toast.error(err.message || "Login failed");
    } finally {
    setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    devLog(`[Auth] Registering new user:`, { username: signupName, email: signupEmail, address: signupAddress });
    try {
      const res = await userService.register({ username: signupName, email: signupEmail, password: signupPassword, address: signupAddress });
      localStorage.setItem('token', res.token);
      devLog(`[Auth] Registration successful! User data:`, res);
    toast.success("Account created successfully!");
      navigate('/restaurants');
      devLog('[Auth] Redirected to /restaurants after signup');
    } catch (err: any) {
      devError(`[Auth] Registration failed for ${signupEmail}:`, err);
      toast.error(err.message || "Registration failed");
    } finally {
    setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signinEmail) {
      toast.error("Please enter your email above first.");
      return;
    }
    // Manual email format check
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(signinEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const res = await fetch("http://localhost:9000/api/v1/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signinEmail })
      });
      if (!res.ok) {
        let errorMsg = "Failed to send password reset email";
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send password reset email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-primary">StreamMyMeal</span>
          </Link>
          <CardTitle>Welcome to StreamMyMeal</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="your@email.com" className="pl-10" required value={signinEmail} onChange={e => setSigninEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Your password" 
                      className="pl-10 pr-10" 
                      required 
                      value={signinPassword} onChange={e => setSigninPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <Button type="button" variant="link" className="w-full mt-0" onClick={handleForgotPassword}>
                  Forgot Password?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="Your full name" className="pl-10" required value={signupName} onChange={e => setSignupName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="your@email.com" className="pl-10" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a password" 
                      className="pl-10 pr-10" 
                      required 
                      value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-address">Address</Label>
                  <div className="relative">
                    <Input id="signup-address" placeholder="Your address" className="pl-10" required value={signupAddress} onChange={e => setSignupAddress(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;