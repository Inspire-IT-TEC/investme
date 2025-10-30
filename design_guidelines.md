# InvestMe Registration Landing Page - Design Guidelines

## Design Approach

**Framework**: Material Design principles adapted for fintech credibility
**Reference Inspiration**: Stripe's clean forms + Robinhood's approachable fintech aesthetic
**Core Principle**: Build immediate trust while minimizing friction to registration

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - Modern, highly legible for forms
- Headings: 700 weight
- Body: 400 weight
- Form labels: 500 weight

**Hierarchy**:
- Hero headline (left promotional): text-4xl lg:text-5xl, font-bold, leading-tight
- Subheadings: text-2xl lg:text-3xl, font-bold
- Form labels: text-sm, font-medium, uppercase tracking-wide
- Input text: text-base
- Supporting copy: text-lg, leading-relaxed
- Trust indicators/stats: text-3xl font-bold with text-sm labels

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
**Container**: max-w-7xl with px-4 md:px-6 lg:px-8
**Section Padding**: py-12 md:py-16 lg:py-20

**Desktop Layout (lg:)**: 
- Two-column grid (60/40 split)
- Left: Promotional content (60%)
- Right: Form card (40%)

**Mobile Layout**: 
- Stack vertically
- Promotional content condensed at top
- Form card full width below

## Component Structure

### Header
- Fixed/sticky positioning with backdrop blur
- Logo left-aligned (h-8 md:h-10)
- Optional: Login link right-aligned (text-sm, understated)
- Padding: py-4 md:py-6

### Left Panel - Promotional Content

**Hero Section**:
- Main headline emphasizing value proposition
- Supporting subheadline (max-w-xl)
- 2-3 key benefit bullets with checkmark icons (Heroicons)
- Social proof element: "Junte-se a 50.000+ investidores" with small avatars overlap

**Trust Indicators Section**:
- 3-column grid of statistics
- Large numbers (text-4xl) with small labels below
- Examples: "R$ 500M+ investidos", "15% retorno médio", "10K+ usuários ativos"

**Testimonial Block**:
- Single featured testimonial with photo
- 5-star rating display
- Name, role, and brief quote (max-w-md)

**Partner Logos** (if applicable):
- Grayscale logo grid showing regulatory compliance or partners
- Small text: "Regulamentado pela CVM" or similar

### Right Panel - Registration Form Card

**Card Container**:
- Elevated card with shadow-xl
- Rounded corners: rounded-2xl
- Padding: p-8 md:p-10
- Subtle border treatment

**Form Structure**:
- Heading: "Comece a Investir Hoje" (text-2xl, font-bold)
- Subtext: Brief 1-line benefit (text-sm)

**Input Fields** (stack vertically with gap-6):
1. Nome Completo (single field)
2. Email
3. Telefone (with country code dropdown if needed)
4. Senha (with strength indicator bar below)
5. Confirmar Senha

**Input Styling**:
- Height: h-12
- Border: 2px solid with subtle default state
- Rounded: rounded-lg
- Focus state: ring treatment
- Error state: Red border with error message below (text-xs)
- Icon positioning: Prefix icons for email/phone fields

**Submit Button**:
- Full width (w-full)
- Height: h-12
- Rounded: rounded-lg
- Text: text-base font-semibold
- Icon: Right arrow Heroicon
- Drop shadow for depth

**Supporting Elements**:
- Checkbox: "Aceito os termos e condições" (text-xs with linked terms)
- Security badge: Small lock icon + "Seus dados estão seguros" (text-xs, centered)
- Alternative action: "Já tem conta? Faça login" link (text-sm, centered)

### Footer (Below Form Card on Mobile, Bottom on Desktop)
- Minimal: Copyright, Privacy Policy, Terms links
- Padding: py-8
- Text: text-xs

## Images

**Hero Background** (Left Panel):
- Modern abstract financial growth visualization OR professional investor imagery
- Subtle overlay gradient for text legibility
- Position: background image with object-cover
- Treatment: Slight blur or opacity overlay to not compete with text

**Testimonial Photo**:
- Circular avatar (w-16 h-16)
- Professional headshot style

**Trust Badges/Logos**:
- Partner logos or security certifications
- Grayscale treatment for consistency

## Responsive Behavior

**Mobile (<768px)**:
- Header: Compressed logo, minimal padding
- Left content: Condensed to essential value prop + 1 statistic
- Form card: Full width, reduced padding (p-6)
- Stack order: Logo → Brief value prop → Form → Footer

**Tablet (768px-1024px)**:
- Begin two-column layout with adjusted ratio (55/45)
- Show more promotional content

**Desktop (>1024px)**:
- Full two-column layout (60/40)
- All promotional elements visible
- Form card fixed width (max-w-md)

## Accessibility Standards

- Form labels always visible (no placeholder-only inputs)
- Focus indicators on all interactive elements
- Proper heading hierarchy (h1 for main headline, h2 for form title)
- ARIA labels for icon-only elements
- Error messages associated with inputs via aria-describedby
- Sufficient contrast ratios throughout

## Icon Library

**Heroicons** (outline style via CDN):
- Check circles for benefits list
- Lock for security indicator
- Arrow right for submit button
- Envelope for email field
- Phone for phone field
- Eye/Eye-off for password visibility toggle

## Animation Approach

**Minimal, purposeful animations only**:
- Form input focus: Smooth border transition
- Button hover: Subtle lift (translate-y-[-2px])
- Card: Subtle entrance fade on page load (optional)
- NO scroll animations, NO complex interactions