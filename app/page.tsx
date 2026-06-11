'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Calendar, Clock, Timer, Monitor, User, Mail, Phone, GraduationCap,
  Code, Brain, MessageSquare, Eye, Database, Bot, Scale, Rocket,
  BookOpen, Award, Globe, Users, TrendingUp, Briefcase, Sparkles,
  CheckCircle2
} from 'lucide-react';
import { createRazorpayOrder, verifyRazorpayPayment, type RegistrationData } from '@/lib/api';

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Scroll animation hook
function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  useScrollAnimation(); // Initialize scroll animations
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    grade: '',
    interests: [],
    experience: '',
    message: ''
  });

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Starting payment flow...');
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      console.log('Razorpay script loaded:', scriptLoaded);
      
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      console.log('Creating order with backend...');
      console.log('Order data:', {
        amount: 75000,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: formData
      });
      
      // Create Razorpay order
      const orderResponse = await createRazorpayOrder({
        amount: 75000, // ₹750 in paise (750 * 100)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: formData
      });

      console.log('Order response:', orderResponse);

      if (!orderResponse.success || !orderResponse.data) {
        alert('Failed to create order. Please try again. Check console for details.');
        console.error('Order creation failed:', orderResponse);
        setIsSubmitting(false);
        return;
      }

      const order = orderResponse.data;

      // Check if Razorpay key is configured
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        alert('Razorpay is not configured. Please contact support.');
        console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID is missing');
        setIsSubmitting(false);
        return;
      }

      console.log('Opening Razorpay payment modal...');

      // Razorpay payment options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'DexLabs AI Workshop',
        description: 'AI & Machine Learning Workshop Registration - June 14, 2026',
        image: '/DexLabs.PNG',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const registrationDataForBackend = {
              ...formData,
              interests: formData.interests.join(', ')
            };
            
            console.log('Verifying payment with data:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationData: registrationDataForBackend
            });
            
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationData: registrationDataForBackend as any
            });

            if (verifyResponse.success) {
              setShowConfetti(true);
              
              setTimeout(() => {
                alert('🎉 Registration & Payment Successful!\n\nPayment ID: ' + response.razorpay_payment_id + '\n\nWelcome to the AI Workshop!\nCheck your email for workshop details and Zoom link.');
                setShowConfetti(false);
                
                // Reset form
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  grade: '',
                  interests: [],
                  experience: '',
                  message: ''
                });
              }, 1000);
            } else {
              alert('Payment successful but registration failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment successful but verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          grade: formData.grade,
          experience: formData.experience,
          interests: formData.interests.join(', ')
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            alert('Payment cancelled. Please complete the payment to register for the workshop.');
          }
        }
      };

      // Open Razorpay payment modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate payment. Please try again or contact support.');
      setIsSubmitting(false);
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Only render animations on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-violet-950 to-black p-5 overflow-x-hidden relative" suppressHydrationWarning>
      {/* Rotating Hex Grid Background */}
      <div className="hex-background"></div>
      
      {/* Scan Line Effect */}
      <div className="scan-line"></div>
      
      {/* Floating Particles - Client Side Only */}
      {mounted && Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            background: ['#3b82f6', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)]
          }}
        />
      ))}
      
      {/* Matrix Rain Effect - Client Side Only */}
      {mounted && Array.from({ length: 30 }).map((_, i) => (
        <div
          key={`matrix-${i}`}
          className="matrix-char"
          style={{
            left: `${(i * 3.33)}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          {['0', '1', '{', '}', '[', ']', '<', '>', 'AI', 'ML'][Math.floor(Math.random() * 10)]}
        </div>
      ))}
      
      {/* Binary Rain - Client Side Only */}
      {mounted && Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`binary-${i}`}
          className="binary-rain"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 3}s`
          }}
        >
          {Math.random() > 0.5 ? '01010101' : '10101010'}
        </div>
      ))}
      
      {/* Character Background */}
      <div className="fixed top-0 left-0 right-0 pointer-events-none flex items-start justify-center opacity-50 pt-24">
        <Image
          src="/DexBro-Char.PNG"
          alt="DexBro Background"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      {/* Sliding Text Banner */}
      <div className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 py-3 overflow-hidden relative z-20 shadow-lg">
        <div className="flex whitespace-nowrap animate-slide-left">
          <div className="flex items-center gap-8 px-8">
            <span className="text-white font-semibold">✨ Learn AI with hands-on projects</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🚀 Build real-world AI applications</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🎓 Get certified in AI & ML</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">💻 Live 90-minute hands-on session</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🌟 Expert mentorship & guidance</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">📚 Access to premium AI tools</span>
            <span className="text-white/80">•</span>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex items-center gap-8 px-8">
            <span className="text-white font-semibold">✨ Learn AI with hands-on projects</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🚀 Build real-world AI applications</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🎓 Get certified in AI & ML</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">💻 Live 90-minute hands-on session</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">🌟 Expert mentorship & guidance</span>
            <span className="text-white/80">•</span>
            <span className="text-white font-semibold">📚 Access to premium AI tools</span>
            <span className="text-white/80">•</span>
          </div>
        </div>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 2 + 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-12 mt-57 md:mt-40">
          <div className="flex justify-center mb-6">
            <div className="relative p-8 rounded-3xl neon-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30 blur-3xl rounded-full"></div>
              <Image
                src="/DexLabs.PNG"
                alt="DexLabs Logo"
                width={400}
                height={160}
                className="relative drop-shadow-2xl hologram-effect"
                style={{ 
                  mixBlendMode: 'lighten',
                  filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))'
                }}
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI & Machine Learning Workshop
          </h1>
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-300 font-medium">
            <GraduationCap className="text-violet-400" size={24} />
            <span>For Students in Grades 6-12</span>
          </div>
        </div>

        {/* Workshop Info */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-gray-700 scroll-animate">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Workshop Details
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Calendar, label: 'Date', value: 'June 14, 2026' },
              { icon: Clock, label: 'Time', value: '11:00 AM - 2:00 PM' },
              { icon: Timer, label: 'Duration', value: '3+ Hours' },
              { icon: Monitor, label: 'Platform', value: 'Zoom' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-gray-800/50 p-5 rounded-xl text-center border border-gray-700 hover:border-violet-500 transition-colors"
                >
                  <Icon className="mx-auto mb-2 text-violet-400" size={28} />
                  <strong className="block text-gray-300 text-sm mb-1">{item.label}</strong>
                  <div className="text-white text-sm font-medium">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="text-center bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 line-through text-xl mb-2">₹1487</div>
            <div className="text-green-400 text-5xl font-bold my-2">₹750</div>
            <div className="text-gray-300 text-sm">Early Bird Special - Limited Seats Available</div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-gray-700 scroll-animate">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            Register for the Workshop
          </h2>
          <p className="text-center text-gray-400 mb-8">Fill in your details to secure your spot</p>

          <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors placeholder-gray-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors placeholder-gray-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Phone size={16} />
                Phone Number (Parent/Guardian)
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors placeholder-gray-500"
                placeholder="+91 1234567890"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Grade */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <GraduationCap size={16} />
                  Current Grade
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors"
                >
                  <option value="" className="bg-gray-800">Select grade</option>
                  <option value="6" className="bg-gray-800">Grade 6</option>
                  <option value="7" className="bg-gray-800">Grade 7</option>
                  <option value="8" className="bg-gray-800">Grade 8</option>
                  <option value="9" className="bg-gray-800">Grade 9</option>
                  <option value="10" className="bg-gray-800">Grade 10</option>
                  <option value="11" className="bg-gray-800">Grade 11</option>
                  <option value="12" className="bg-gray-800">Grade 12</option>
                </select>
              </div>

              {/* AI Experience */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <Code size={16} />
                  Experience Level
                </label>
                <select
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors"
                >
                  <option value="" className="bg-gray-800">Select level</option>
                  <option value="beginner" className="bg-gray-800">Beginner</option>
                  <option value="some" className="bg-gray-800">Some Experience</option>
                  <option value="intermediate" className="bg-gray-800">Intermediate</option>
                  <option value="advanced" className="bg-gray-800">Advanced</option>
                </select>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
                <Brain size={16} />
                Areas of Interest (Select all that apply)
              </label>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
                {[
                  { id: 'ml', label: 'Machine Learning Basics' },
                  { id: 'chatbots', label: 'Chatbots & NLP' },
                  { id: 'vision', label: 'Computer Vision' },
                  { id: 'python', label: 'Python for AI' },
                  { id: 'datascience', label: 'Data Science' },
                  { id: 'robotics', label: 'AI Robotics' },
                  { id: 'ethics', label: 'AI Ethics' },
                  { id: 'projects', label: 'Real-World Projects' }
                ].map((interest) => (
                  <label
                    key={interest.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={interest.id}
                      checked={formData.interests.includes(interest.id)}
                      onChange={() => handleInterestChange(interest.id)}
                      className="w-4 h-4 cursor-pointer accent-violet-600 rounded"
                    />
                    <span className="text-sm text-gray-300">{interest.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <MessageSquare size={16} />
                Why do you want to learn AI? (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none transition-colors resize-none placeholder-gray-500"
                placeholder="Share your goals or questions..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed neon-pulse hover:glitch-effect"
            >
              {isSubmitting ? 'Processing Payment...' : 'Pay ₹750 & Register Now'}
            </button>
          </form>
        </div>

        {/* AI Concepts Visualization */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 mt-8 shadow-2xl border border-gray-700 scroll-animate">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Explore AI Concepts
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Neural Network Animation */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-violet-500 transition-all group">
              <h3 className="text-xl font-bold text-violet-300 mb-4 text-center">Neural Networks</h3>
              <div className="flex justify-center items-center h-48">
                <svg width="200" height="180" viewBox="0 0 200 180" className="overflow-visible">
                  {/* Input Layer */}
                  <circle cx="30" cy="40" r="8" fill="#3b82f6" className="animate-pulse-node" style={{animationDelay: '0s'}} />
                  <circle cx="30" cy="90" r="8" fill="#3b82f6" className="animate-pulse-node" style={{animationDelay: '0.2s'}} />
                  <circle cx="30" cy="140" r="8" fill="#3b82f6" className="animate-pulse-node" style={{animationDelay: '0.4s'}} />
                  
                  {/* Hidden Layer */}
                  <circle cx="100" cy="30" r="8" fill="#8b5cf6" className="animate-pulse-node" style={{animationDelay: '0.6s'}} />
                  <circle cx="100" cy="70" r="8" fill="#8b5cf6" className="animate-pulse-node" style={{animationDelay: '0.8s'}} />
                  <circle cx="100" cy="110" r="8" fill="#8b5cf6" className="animate-pulse-node" style={{animationDelay: '1s'}} />
                  <circle cx="100" cy="150" r="8" fill="#8b5cf6" className="animate-pulse-node" style={{animationDelay: '1.2s'}} />
                  
                  {/* Output Layer */}
                  <circle cx="170" cy="60" r="8" fill="#06b6d4" className="animate-pulse-node" style={{animationDelay: '1.4s'}} />
                  <circle cx="170" cy="120" r="8" fill="#06b6d4" className="animate-pulse-node" style={{animationDelay: '1.6s'}} />
                  
                  {/* Connections with animated flow */}
                  <line x1="38" y1="40" x2="92" y2="30" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3" className="animate-data-flow" strokeDasharray="4" />
                  <line x1="38" y1="90" x2="92" y2="70" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3" className="animate-data-flow" strokeDasharray="4" style={{animationDelay: '0.5s'}} />
                  <line x1="108" y1="30" x2="162" y2="60" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" className="animate-data-flow" strokeDasharray="4" style={{animationDelay: '1s'}} />
                  <line x1="108" y1="110" x2="162" y2="120" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" className="animate-data-flow" strokeDasharray="4" style={{animationDelay: '1.5s'}} />
                </svg>
              </div>
              <p className="text-gray-400 text-sm text-center mt-4">Learn how neural networks process information layer by layer</p>
            </div>

            {/* NLP Animation */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all group">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Natural Language Processing</h3>
              <div className="flex justify-center items-center h-48 flex-col gap-3">
                <div className="relative">
                  <div className="text-4xl animate-bounce-slow">💬</div>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['Hello', 'AI', 'World', '!'].map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-600/30 rounded-lg text-blue-200 text-sm font-mono animate-fade-in-up"
                      style={{animationDelay: `${i * 0.2}s`}}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="w-12 h-2 bg-violet-600 rounded animate-pulse"></div>
                  <div className="w-16 h-2 bg-blue-600 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-10 h-2 bg-cyan-600 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm text-center mt-4">Understand how AI processes and generates human language</p>
            </div>

            {/* Machine Learning Animation */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500 transition-all group">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">Machine Learning</h3>
              <div className="flex justify-center items-center h-48">
                <svg width="200" height="180" viewBox="0 0 200 180">
                  {/* Data points */}
                  <g className="animate-pulse-node">
                    <circle cx="40" cy="140" r="4" fill="#3b82f6" />
                    <circle cx="60" cy="120" r="4" fill="#3b82f6" />
                    <circle cx="80" cy="100" r="4" fill="#3b82f6" />
                    <circle cx="100" cy="80" r="4" fill="#3b82f6" />
                    <circle cx="120" cy="60" r="4" fill="#3b82f6" />
                    <circle cx="140" cy="40" r="4" fill="#3b82f6" />
                  </g>
                  {/* Learning curve */}
                  <path
                    d="M 40 140 Q 100 80 160 40"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    fill="none"
                    className="animate-data-flow"
                    strokeDasharray="4"
                  />
                  {/* Prediction arrow */}
                  <g className="animate-bounce-slow">
                    <line x1="160" y1="40" x2="180" y2="30" stroke="#10b981" strokeWidth="2" />
                    <polygon points="180,30 175,35 185,35" fill="#10b981" />
                  </g>
                </svg>
              </div>
              <p className="text-gray-400 text-sm text-center mt-4">Discover how machines learn from data and improve over time</p>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="bg-gradient-to-br from-violet-900/40 to-blue-900/40 backdrop-blur-lg rounded-3xl p-8 mt-8 shadow-2xl border-2 border-blue-500/30 scroll-animate">
          <h2 className="text-4xl font-bold text-violet-300 text-center mb-8 flex items-center justify-center gap-3">
            <Award size={36} />
            What You&apos;ll Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Brain, text: 'Introduction to AI & Machine Learning - Understand how AI works and its real-world applications' },
              { icon: Code, text: 'Python Programming Fundamentals - Learn the most popular language for AI development' },
              { icon: Bot, text: 'Build Your Own AI Model - Create a working AI project from scratch' },
              { icon: Sparkles, text: 'Neural Networks & Deep Learning - Explore how machines learn and think' },
              { icon: Rocket, text: 'Hands-on Projects - Work on practical AI applications like image recognition & chatbots' },
              { icon: Award, text: 'Certificate of Completion - Showcase your new AI skills with an official certificate' },
              { icon: Globe, text: 'AI Tools & Resources - Get access to premium AI platforms and learning materials' },
              { icon: Users, text: 'Mentorship & Community - Connect with instructors and fellow AI enthusiasts' }
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="bg-black/40 backdrop-blur-sm p-5 rounded-xl flex items-start gap-4 hover:translate-x-2 hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg border-l-4 border-violet-500 animate-slide-in-benefit"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Icon className="text-blue-400 flex-shrink-0 mt-1" size={32} />
                  <span className="text-base font-medium text-gray-200 leading-relaxed">{benefit.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Learn AI */}
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-10 mt-8 shadow-2xl border-2 border-blue-400 scroll-animate">
          <h2 className="text-4xl font-bold text-center mb-10 text-white flex items-center justify-center gap-3">
            <Sparkles size={36} />
            Why Learn AI Now?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-black/20 rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <TrendingUp className="mx-auto mb-4 text-yellow-300" size={56} />
              <h3 className="text-2xl font-bold mb-3 text-white">Future-Ready Skills</h3>
              <p className="text-blue-100 text-lg leading-relaxed">AI is transforming every industry. Get ahead of the curve and prepare for the future!</p>
            </div>
            <div className="text-center p-6 bg-black/20 rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <Briefcase className="mx-auto mb-4 text-green-300" size={56} />
              <h3 className="text-2xl font-bold mb-3 text-white">Career Opportunities</h3>
              <p className="text-blue-100 text-lg leading-relaxed">AI professionals are in high demand with excellent salaries and exciting roles</p>
            </div>
            <div className="text-center p-6 bg-black/20 rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <Sparkles className="mx-auto mb-4 text-pink-300" size={56} />
              <h3 className="text-2xl font-bold mb-3 text-white">Creative Problem Solving</h3>
              <p className="text-blue-100 text-lg leading-relaxed">Use AI to build amazing projects and solve real-world problems</p>
            </div>
          </div>
        </div>

        {/* Student Problems - Scattered Pills */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 mt-8 shadow-2xl border border-gray-700 scroll-animate">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Common Student Struggles</h3>
            <p className="text-gray-400">Understand what to improve next</p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {[
              { text: 'Missed homework', color: 'bg-pink-600/20 text-pink-300 border-pink-600/30' },
              { text: 'Lost resources', color: 'bg-red-600/20 text-red-300 border-red-600/30' },
              { text: 'Low focus', color: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
              { text: 'Exam panic', color: 'bg-purple-600/20 text-purple-300 border-purple-600/30' },
              { text: 'Scattered notes', color: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30' },
              { text: 'No clear goals', color: 'bg-rose-600/20 text-rose-300 border-rose-600/30' },
              { text: 'Attendance anxiety', color: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30' },
              { text: 'Group updates missed', color: 'bg-violet-600/20 text-violet-300 border-violet-600/30' },
              { text: 'No revision plan', color: 'bg-sky-600/20 text-sky-300 border-sky-600/30' },
              { text: 'Forgotten deadlines', color: 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-600/30' },
              { text: 'Too many apps', color: 'bg-teal-600/20 text-teal-300 border-teal-600/30' },
              { text: 'Weak areas hidden', color: 'bg-amber-600/20 text-amber-300 border-amber-600/30' },
              { text: 'Marks feel random', color: 'bg-orange-600/20 text-orange-300 border-orange-600/30' },
              { text: 'Doubts pile up', color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30' }
            ].map((problem, index) => (
              <div
                key={index}
                className={`${problem.color} px-4 py-2 rounded-full border text-sm font-medium hover:scale-105 transition-transform cursor-default shadow-lg`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {problem.text}
              </div>
            ))}
          </div>
        </div>

        {/* Student Problems - Floating Tags */}
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-md rounded-3xl p-8 mt-8 shadow-2xl border border-gray-700/50 scroll-animate overflow-hidden relative">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            Common Student Struggles
          </h2>
          <p className="text-gray-400 text-center mb-8">Problems students face every day that DexBro helps solve</p>
          
          <div className="relative h-32 flex flex-wrap gap-3 items-center justify-center">
            {[
              { text: 'Missed homework', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
              { text: 'Exam panic', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { text: 'Scattered notes', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
              { text: 'Attendance anxiety', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { text: 'No revision plan', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
              { text: 'Forgotten deadlines', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
              { text: 'Low focus', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { text: 'No clear goals', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
              { text: 'Group updates missed', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
              { text: 'Weak areas hidden', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
              { text: 'Too many apps', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
              { text: 'Marks feel random', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
              { text: 'Doubts pile up', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { text: 'Lost resources', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
            ].map((problem, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-full border ${problem.color} text-sm font-medium whitespace-nowrap animate-float-tag`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: `${3 + (index % 3)}s`
                }}
              >
                {problem.text}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-violet-400 font-semibold text-lg">✨ DexBro organizes everything in one smart dashboard</p>
          </div>
        </div>

        {/* How DexBro Redefines Learning */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 md:p-10 mt-8 shadow-2xl border border-gray-700 scroll-animate">
          <div className="text-center mb-8">
            <div className="inline-block bg-violet-600/20 px-6 py-2 rounded-full border border-violet-500/30 mb-4">
              <span className="text-violet-300 font-semibold">Study Transformation</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How DexBro Redefines Student Life
            </h2>
            <p className="text-gray-400 text-lg">
              A side-by-side comparison of scattered student routines versus a single smart study dashboard
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Workflow / Feature</th>
                  <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">The Scattered Way</th>
                  <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">With DexBro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  {
                    feature: 'Student Setup',
                    icon: '📚',
                    scattered: 'Profiles, class details, subjects, interests, and goals live in separate notebooks or apps',
                    withDexbro: 'Student onboarding captures profile, class, section, subjects, interests, and academic goals'
                  },
                  {
                    feature: 'Daily Planning',
                    icon: '📅',
                    scattered: 'Checking group messages, diaries, and calendars to remember classes, tests, and events',
                    withDexbro: 'Personal timetable shows daily and weekly schedules, exam dates, timings, and upcoming events'
                  },
                  {
                    feature: 'Attendance Tracking',
                    icon: '✅',
                    scattered: 'Waiting for school updates and guessing whether attendance is still in a safe range',
                    withDexbro: 'Attendance records, absence reports, trends, percentages, and downloadable reports stay visible'
                  },
                  {
                    feature: 'Progress Analytics',
                    icon: '📊',
                    scattered: 'Marks, homework completion, strengths, and weak areas are hard to connect manually',
                    withDexbro: 'Student analytics reveal performance, attendance, homework progress, strengths, and weaknesses'
                  },
                  {
                    feature: 'AI Learning Tools',
                    icon: '🤖',
                    scattered: 'Waiting until the next class or searching random videos when a concept is unclear',
                    withDexbro: 'AI support helps with doubts, explanations, personalized plans, quizzes, and career guidance'
                  },
                  {
                    feature: 'Homework System',
                    icon: '📝',
                    scattered: 'Assignments get buried in chats, photos, notebooks, and last-minute reminders',
                    withDexbro: 'View tasks, submit work, track deadlines, receive feedback, and get AI-assisted study support'
                  },
                  {
                    feature: 'Exam Center',
                    icon: '📖',
                    scattered: 'Practice papers and mock test analysis are disconnected from revision planning',
                    withDexbro: 'Mock tests, practice papers, rankings, performance analysis, and improvement suggestions align'
                  },
                  {
                    feature: 'Collaboration',
                    icon: '💬',
                    scattered: 'Study groups, announcements, school updates, and resources get scattered across chats',
                    withDexbro: 'Community spaces support discussions, study groups, resource sharing, messaging, and updates'
                  },
                  {
                    feature: 'Reminders',
                    icon: '🔔',
                    scattered: 'Deadlines depend on memory, sticky notes, and repeated messages from classmates',
                    withDexbro: 'Tasks, reminders, streaks, focus sessions, and achievement tracking keep study momentum clear'
                  },
                  {
                    feature: 'Anytime Access',
                    icon: '📱',
                    scattered: 'Notes and school data stay split across devices, notebooks, and offline files',
                    withDexbro: 'DexBro keeps the student dashboard available for planning, learning, and progress review'
                  }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{row.icon}</span>
                        <span className="text-white font-semibold">{row.feature}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span className="text-gray-400 text-sm">{row.scattered}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-gray-300 text-sm">{row.withDexbro}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with DexBro Image */}
        <div className="mt-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative p-4">
              <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full"></div>
              <Image
                src="/DexBro.png"
                alt="DexBro"
                width={150}
                height={150}
                className="relative"
                style={{ 
                  mixBlendMode: 'lighten',
                  filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6))'
                }}
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 DexLabs. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}