# 🎨 Design System - AI Workshop Registration

## Color Scheme: Blue, Violet & Black

### Primary Colors
```
Blue:    #3b82f6 (rgb(59, 130, 246))
Violet:  #8b5cf6 (rgb(139, 92, 246))
Black:   #000000 (rgb(0, 0, 0))
```

### Secondary Colors
```
Dark Blue:    #1e3a8a
Dark Violet:  #581c87
Light Blue:   #60a5fa
Light Violet: #a78bfa
```

### Accent Colors
```
Green:  #10b981 (Success/Price)
Yellow: #fbbf24 (Highlights)
Pink:   #ec4899 (Creative accents)
Cyan:   #06b6d4 (Tech accents)
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Heading Sizes
- H1: `text-5xl md:text-7xl` (48px/72px)
- H2: `text-4xl` (36px)
- H3: `text-xl md:text-2xl` (20px/24px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)

## Components

### Glassmorphism Cards
```css
background: from-blue-900/40 to-violet-900/40
backdrop-blur-lg
border: 2px border-blue-500/30 or border-violet-500/30
```

### Form Inputs
```css
background: black/50
border: 2px border-blue-500/30
focus:border-violet-500
focus:ring-2 ring-violet-500/50
```

### Buttons
```css
Primary: bg-gradient-to-r from-blue-600 to-violet-600
Hover: scale-[1.02] shadow-2xl shadow-violet-500/50
Active: scale-95
```

## Icons (Lucide React)

### Navigation & Actions
- User, Mail, Phone, GraduationCap
- Calendar, Clock, Timer, Monitor
- MessageSquare, CheckCircle2

### AI/Tech Theme
- Brain, Bot, Rocket, Code
- Eye, Database, Scale
- Sparkles, Globe, Award

### Business/Career
- Briefcase, TrendingUp, Users
- BookOpen

## Animations

### Entrance Animations
- `bounce-in` (1s ease)
- `slide-in-left` (1s ease)
- `slide-in-right` (1s ease)
- `slide-in-up` (1s ease)
- `fade-in-up` (0.8s ease)

### Continuous Animations
- `gradient-shift` (15s infinite)
- `gradient-text` (5s infinite)
- `float` (20s infinite)
- `bounce-slow` (3s infinite)
- `pulse-slow` (4s infinite)

### Interaction Animations
- `hover:scale-105` (0.3s)
- `hover:translate-x-2` (0.3s)
- `focus:scale-[1.01]` (0.3s)
- `confetti-fall` (on submit)

## Layout Structure

### Max Width Container
```css
max-w-6xl mx-auto
```

### Spacing
- Section gap: `mb-8` or `mt-8` (32px)
- Card padding: `p-8` or `p-10` (32px/40px)
- Element gap: `gap-4` to `gap-8` (16px-32px)

### Grid Systems
- Workshop info: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Interests: `grid md:grid-cols-2`
- Why AI: `grid md:grid-cols-3`

## Images

### Logo & Branding
- **DexLabs.PNG**: Header logo (200x80)
- **DexBro-Char.PNG**: Animated mascot (150x150)
- **DexBro.png**: Footer mascot (120x120)

### Image Optimization
```tsx
<Image 
  src="/image.png"
  width={...}
  height={...}
  alt="..."
  priority // for above-fold images
  className="animate-..."
/>
```

## Responsive Breakpoints

```css
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (laptop)
xl:  1280px (desktop)
2xl: 1536px (large desktop)
```

## States

### Form Inputs
- Default: `border-blue-500/30`
- Focus: `border-violet-500`
- Error: `border-red-500`
- Success: `border-green-500`

### Buttons
- Default: gradient blue-violet
- Hover: scaled + shadow
- Active: scale-95
- Disabled: opacity-50 cursor-not-allowed

### Checkboxes/Interests
- Unchecked: `border-transparent bg-transparent`
- Checked: `bg-violet-900/50 border-2 border-violet-500`

## Accessibility

### Focus States
All interactive elements have visible focus states with `focus:ring-2` and `focus:outline-none`

### Contrast Ratios
- Text on dark background: High contrast whites/light blues
- Labels: Blue-300 (#93c5fd)
- Body text: Gray-200 (#e5e7eb)

### Interactive Areas
Minimum touch target: 44x44px (achieved via padding)

## Best Practices

1. **Dark Mode Only**: Designed exclusively for dark backgrounds
2. **Glass Effects**: Use backdrop-blur-lg with semi-transparent backgrounds
3. **Gradients**: Blue-to-violet for primary actions and headers
4. **Icons**: Always pair text labels with icons for clarity
5. **Animations**: Use sparingly, prioritize performance
6. **Borders**: Use semi-transparent borders (e.g., border-blue-500/30)
7. **Shadows**: Layer shadows for depth (shadow-xl, shadow-2xl)
