# 🤖 AI & Machine Learning Workshop - Registration Page

A sleek, modern registration form designed for students in grades 6-12 interested in learning AI and Machine Learning. Features a professional dark theme with Blue, Violet, and Black color scheme, Lucide React icons, and smooth animations.

## ✨ Features

### 🎨 Modern Dark Design
- **Color Scheme**: Blue, Violet, and Black for a professional tech aesthetic
- **Glassmorphism**: Backdrop blur effects with transparent backgrounds
- **Gradient Accents**: Smooth color transitions throughout
- **Professional Icons**: Lucide React icons instead of emojis
- **Brand Integration**: DexLabs logo and DexBro character images

### 🖼️ Images & Branding
- **DexLabs Logo** - Displayed prominently in the header
- **DexBro Character** - Animated mascot throughout the page
- **Professional Layout** - Clean, modern design suitable for teenagers

### 📝 Comprehensive Registration Form
- **Personal Information**
  - Full Name
  - Email Address
  - Phone Number (Parent/Guardian)
  
- **Academic Information**
  - Current Grade (6-12)
  - Programming/AI Experience Level
  
- **Interest Selection** - Multiple AI topics with icons:
  - 🧠 Machine Learning Basics (Brain icon)
  - 💬 Chatbots & NLP (MessageSquare icon)
  - 👁️ Computer Vision (Eye icon)
  - 🐍 Python Programming (Code icon)
  - 📊 Data Science (Database icon)
  - 🤖 AI in Robotics (Bot icon)
  - ⚖️ AI Ethics (Scale icon)
  - 🚀 Real-World AI Projects (Rocket icon)

- **Optional Message** - Space for students to share their goals

### 🎓 Workshop Information Displayed
- **Workshop Details** - Date, time, duration, platform
- **What You'll Learn** section with 8 key learning outcomes:
  - Introduction to AI & Machine Learning
  - Python Programming Fundamentals
  - Building Your Own AI Model
  - Neural Networks & Deep Learning
  - Hands-on Projects
  - Certificate of Completion
  - AI Tools & Resources
  - Mentorship & Community

- **Why Learn AI Now?** - Motivational section highlighting:
  - Future-Ready Skills
  - Career Opportunities
  - Creative Problem Solving

### ✨ Interactive Features
- **Smooth hover effects** on all interactive elements
- **Focus states** with scale and glow effects
- **Confetti animation** on successful registration
- **Form validation** with required fields
- **Responsive grid layouts**

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the workshop registration page.

## 🛠️ Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling framework
- **Lucide React** - Beautiful, consistent icon set
- **React Hooks** - State management (useState)
- **CSS Animations** - Custom keyframe animations for smooth interactions
- **Next.js Image** - Optimized image loading

## 🎨 Color Palette

- **Primary Blue**: `#3b82f6` - Trust and intelligence
- **Primary Violet**: `#8b5cf6` - Creativity and innovation  
- **Dark Blue**: `#1e3a8a` - Deep backgrounds
- **Dark Violet**: `#581c87` - Rich accents
- **Black**: `#000000` - Base background
- **Accent Colors**:
  - Green: `#10b981` - Success states
  - Yellow: `#fbbf24` - Highlights
  - Pink: `#ec4899` - Creative touches

## 🎯 Customization

You can easily customize:

### Workshop Details
Edit the workshop info section in `app/page.tsx`:
- Date and time
- Duration
- Platform
- Pricing

### Learning Topics
Modify the interests array in the form:
- Add/remove AI topics
- Change icons and labels
- Adjust descriptions

### Styling
Update colors and animations in:
- `app/globals.css` - Global styles and animations
- Tailwind classes in components - Utility classes

### Form Fields
Add or modify form fields in the formData state:
- Additional questions
- Different grade ranges
- Custom validation

## 📄 Project Structure

```
dexbro-workshop/
├── app/
│   ├── page.tsx          # Main workshop registration page
│   ├── layout.tsx        # Root layout with metadata
│   ├── globals.css       # Global styles and animations
│   └── favicon.ico       # Site icon
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # This file
```

## 🎬 Animations

Custom CSS animations include:
- `gradient-shift` - Animated background gradient
- `gradient-text` - Animated text gradient
- `pulse-slow` - Subtle pulsing effect
- `float` - Floating icon animation
- `bounce-slow` - Smooth bouncing effect
- `bounce-in` - Entry animation
- `slide-in-*` - Directional slide animations
- `pop-in` - Scale entrance
- `pulse-scale` - Breathing effect
- `fade-in-up` - Fade with upward motion
- `confetti-fall` - Success celebration

## 📦 Dependencies

```json
{
  "next": "^15.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x",
  "typescript": "^5.x"
}
```

## 🔒 Form Handling

The form currently shows a success alert on submission. To connect it to a backend:

1. Add your API endpoint
2. Handle form submission in the `handleSubmit` function
3. Add error handling
4. Implement loading states

Example:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 📧 Support

For questions or issues, please open an issue in the repository.

## 📄 License

This project is open source and available for educational purposes.
