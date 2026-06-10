'use client';

import { useState, FormEvent } from 'react';
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

export default function Home() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        notes: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }
      });
      
      // Create Razorpay order
      const orderResponse = await createRazorpayOrder({
        amount: 75000, // ₹750 in paise (750 * 100)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }
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
            // Verify payment and save registration
            console.log('Verifying payment with data:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationData: formData
            });
            
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationData: formData
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
          color: '#8b5cf6' // Violet color matching your brand
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-violet-950 to-black p-5 overflow-x-hidden relative">
      {/* Character Background */}
      <div className="fixed top-0 left-0 right-0 pointer-events-none flex items-start justify-center opacity-10 pt-10">
        <Image
          src="/DexBro-Char.PNG"
          alt="DexBro Background"
          width={600}
          height={600}
          className="object-contain"
        />
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
            <div className="relative p-8 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30 blur-3xl rounded-full"></div>
              <Image
                src="/DexLabs.PNG"
                alt="DexLabs Logo"
                width={400}
                height={160}
                className="relative drop-shadow-2xl"
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
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-gray-700">
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
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            Register for the Workshop
          </h2>
          <p className="text-center text-gray-400 mb-8">Fill in your details to secure your spot</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full p-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing Payment...' : 'Pay ₹750 & Register Now'}
            </button>
          </form>
        </div>

        {/* What You'll Learn */}
        <div className="bg-gradient-to-br from-violet-900/40 to-blue-900/40 backdrop-blur-lg rounded-3xl p-8 mt-8 shadow-2xl border-2 border-blue-500/30 animate-slide-in-up">
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
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-10 mt-8 shadow-2xl border-2 border-blue-400">
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
