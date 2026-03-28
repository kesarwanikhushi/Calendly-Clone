import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-surface py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-2xl shadow-2xl relative z-10">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
              <span className="text-white text-3xl font-bold tracking-tighter">C</span>
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back
          </h2>
          <p className="mt-3 text-center text-sm text-text-secondary">
            Log in to manage your scheduling
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-error/20 p-4 rounded-lg flex items-center gap-3 animate-pulse">
            <svg className="w-5 h-5 text-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full transition-all focus:ring-2 focus:ring-primary/20"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-3 text-base font-medium shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              Sign up today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
