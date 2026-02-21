'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Truck, Zap, MapPin, BarChart3, ArrowRight, CheckCircle, Clock, Shield, Route } from 'lucide-react';
import DotGrid from '@/components/shared/DotGrid';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <Image src="/images/logo.png" alt="FleetFlow Logo" width={40} height={40} className="rounded-full" />
          <span className="text-2xl font-bold text-black dark:text-white tracking-tight">FleetFlow</span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={() => router.push('/login')} className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors">
            Sign In
          </button>
          <button onClick={() => router.push('/register')} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-white dark:bg-black">
        {/* Animated Dot Grid Background */}
        <div className="absolute inset-0 w-full h-full">
          <DotGrid
            dotSize={4}
            gap={11}
            baseColor="#e4e4e7"
            activeColor="#18181b"
            proximity={110}
            shockRadius={250}
            shockStrength={8}
            resistance={1000}
            returnDuration={3}
            className="dark:hidden"
          />
          <DotGrid
            dotSize={4}
            gap={11}
            baseColor="#27272a"
            activeColor="#fafafa"
            proximity={110}
            shockRadius={250}
            shockStrength={8}
            resistance={1000}
            returnDuration={3}
            className="hidden dark:block"
          />
        </div>
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 dark:from-black/30 dark:via-transparent dark:to-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm text-black dark:text-white font-medium text-sm mb-6 border border-zinc-200 dark:border-zinc-800">
            <Zap size={16} className="mr-2 fill-black dark:fill-white" />
            <span>Real-Time Fleet Intelligence</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-black dark:text-white leading-tight mb-8 drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Fleet management made <span className="text-zinc-600 dark:text-zinc-400">simple</span>.
          </h1>
          <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-10 leading-relaxed max-w-lg drop-shadow-[0_1px_4px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Track vehicles, optimize routes, and manage your entire fleet from one powerful platform. Real-time insights at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => router.push('/register')} className="flex items-center justify-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl hover:-translate-y-1">
              <span>Start Free Trial</span>
              <ArrowRight size={20} />
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white dark:bg-black text-black dark:text-white border border-zinc-200 dark:border-zinc-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <span>Watch Demo</span>
            </button>
          </div>
          <div className="mt-10 flex items-center space-x-6 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <span className="flex items-center drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"><CheckCircle size={16} className="text-black dark:text-white mr-2" /> No credit card required</span>
            <span className="flex items-center drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"><CheckCircle size={16} className="text-black dark:text-white mr-2" /> 14-day free trial</span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-zinc-300 dark:bg-zinc-700 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

          <div className="relative bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-2 ring-1 ring-zinc-100 dark:ring-zinc-800 rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-500 dark:bg-zinc-500"></div>
                </div>
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400">dashboard.fleetflow.com</div>
              </div>
              {/* Mock UI elements */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="bg-black dark:bg-white p-2 rounded-lg text-white dark:text-black"><Truck size={20} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-black dark:text-white text-sm">Vehicle #TRK-001</h4>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Active</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Route: Downtown → Warehouse • ETA: 15 mins</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-lg text-black dark:text-white"><MapPin size={20} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-black dark:text-white text-sm">Route Optimized</h4>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Saved 23 min</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">AI suggested faster route via Highway 101</p>
                  </div>
                </div>
                <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                  <BarChart3 className="text-zinc-400 dark:text-zinc-600" size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        </div>
      </header>

      {/* Features Preview */}
      <section className="bg-zinc-50 dark:bg-zinc-950 py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Everything you need to manage your fleet</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Streamline operations with tools designed for modern fleet managers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Real-Time Tracking', desc: 'Monitor every vehicle in your fleet with live GPS tracking and instant notifications.', icon: MapPin },
              { title: 'Route Optimization', desc: 'AI-powered route planning that saves time, fuel, and reduces operational costs.', icon: Route },
              { title: 'Maintenance Scheduling', desc: 'Automated alerts for vehicle maintenance to keep your fleet running smoothly.', icon: Clock },
              { title: 'Driver Management', desc: 'Track driver performance, hours, and compliance all in one dashboard.', icon: Shield },
              { title: 'Analytics & Reports', desc: 'Comprehensive insights into fleet performance, costs, and efficiency metrics.', icon: BarChart3 },
              { title: 'Smart Automation', desc: 'Automate routine tasks and workflows to focus on what matters most.', icon: Zap }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-black p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-black dark:text-white mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Vehicles Tracked' },
              { value: '500+', label: 'Fleet Managers' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-black dark:text-white mb-2">{stat.value}</div>
                <div className="text-zinc-600 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black dark:bg-white py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white dark:text-black mb-6">Ready to transform your fleet management?</h2>
          <p className="text-xl text-zinc-400 dark:text-zinc-600 mb-10">Join hundreds of fleet managers who trust FleetFlow every day.</p>
          <button onClick={() => router.push('/register')} className="bg-white dark:bg-black text-black dark:text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shadow-xl">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black text-black dark:text-white py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Image src="/images/logo.png" alt="FleetFlow Logo" width={32} height={32} className="rounded-full" />
            <span className="text-2xl font-bold tracking-tight">FleetFlow</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">© 2026 FleetFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
