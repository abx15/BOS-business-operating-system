"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post("/auth/login", data);
      const { accessToken, refreshToken, user } = res.data.data;

      setAuth(user, accessToken, refreshToken);

      document.cookie = `accessToken=${accessToken}; path=/; max-age=900`;
      document.cookie = `userRole=${user.role}; path=/; max-age=604800`;

      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#00151f]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#bc5090]/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#003f5c]/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1000px] bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 bg-white dark:bg-zinc-950">
          <div className="max-w-[360px] mx-auto">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#bc5090] flex items-center justify-center shadow-lg shadow-[#bc5090]/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">BOS.</span>
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold ml-1">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    {...register("email")}
                    className="h-12 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 transition-all focus-visible:ring-2 focus-visible:ring-[#bc5090]/50 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-destructive font-medium ml-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="password" className="text-sm font-semibold">Password</Label>
                  <button type="button" className="text-xs font-semibold text-[#bc5090] hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="h-12 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 transition-all focus-visible:ring-2 focus-visible:ring-[#bc5090]/50 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-destructive font-medium ml-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#bc5090] hover:bg-[#8a508f] text-white font-bold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#bc5090]/20 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account? <br/>
                <span className="text-[#bc5090] font-bold cursor-help mt-1 inline-block">Contact your organization administrator</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Panel */}
        <div className="w-full md:w-[42%] bg-[#003f5c] relative overflow-hidden flex flex-col justify-center p-8 md:p-12">
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#bc5090] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff8531] rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative w-full aspect-square max-w-[320px] mx-auto mb-10"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#bc5090]/30 to-transparent rounded-full blur-3xl animate-pulse" />
              <Image 
                src="/assets/images/login-hero.png" 
                alt="BOS Illustration" 
                fill 
                className="object-contain relative z-10"
                priority
              />
            </motion.div>

            <div className="text-center md:text-left text-white space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                Empower your Business with <span className="text-[#ffd380]">Intelligent</span> Operations.
              </h2>
              <p className="text-[#a0c4ff] text-sm md:text-base font-medium opacity-90">
                Join thousands of businesses streamlining their workflow with our next-gen SaaS platform.
              </p>
            </div>

            {/* Brand Colors Bar */}
            <div className="flex h-1 rounded-full overflow-hidden mt-12 bg-white/10">
              {["#00202e", "#003f5c", "#2c4875", "#8a508f", "#bc5090", "#ff6361", "#ff8531", "#ffa600", "#ffd380"].map((c) => (
                <div key={c} className="flex-1" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-xs font-medium tracking-widest uppercase opacity-50">
        Powered by Antigravity AI
      </div>
    </div>
  );
}
