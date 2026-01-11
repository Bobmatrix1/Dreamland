import { useState, useContext } from "react";
import { motion } from "motion/react";
import { Mail, Lock, User, Phone } from "lucide-react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassInput } from "../ui/glass/GlassInput";
import { GlassButton } from "../ui/glass/GlassButton";
import { AuthContext } from "../../App";
import { toast } from "sonner";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  
  const authContext = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await authContext?.login(email, password);
        toast.success("Welcome back!");
      } else {
        if (!displayName) {
          toast.error("Display name is required for registration");
          setLoading(false);
          return;
        }
        await authContext?.signup(email, password, displayName, phoneNumber);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error(error);
      let message = isLogin ? "Login failed" : "Registration failed";
      if (error.code === 'auth/email-already-in-use') message = "Email already in use";
      if (error.code === 'auth/wrong-password') message = "Invalid password";
      if (error.code === 'auth/user-not-found') message = "User not found";
      if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 will-change-transform"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <GlassCard className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="Dreamland Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg object-cover"
          />
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dreamland
          </h1>
          <p className="text-muted-foreground">
            Team Communication & Storage Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm mb-2">Display Name</label>
              <GlassInput
                icon={<User size={18} />}
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Email</label>
            <GlassInput
              icon={<Mail size={18} />}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm mb-2">Phone Number (Optional)</label>
              <GlassInput
                icon={<Phone size={18} />}
                type="tel"
                placeholder="+1 234 567 890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Password</label>
            <GlassInput
              icon={<Lock size={18} />}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </GlassButton>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
