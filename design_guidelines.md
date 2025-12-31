# QuestInvest Pro - Design Guidelines

## Design Approach
**Reference-Based Strategy**: Drawing from Duolingo's gamification mastery, Robinhood's investment clarity, and modern gaming platforms' immersive aesthetics. Creating a unique hybrid that makes investing feel like an adventure while maintaining financial credibility.

## Typography System
- **Primary Font**: Inter or DM Sans (modern, professional readability)
- **Display/Accent Font**: Orbitron or Rajdhana (tech/gaming feel for headers, quest titles)
- **Hierarchy**: 
  - Hero headlines: 4xl-6xl, display font, bold
  - Section headers: 3xl-4xl, display font, semibold
  - Dashboard stats: 2xl-3xl, tabular numbers
  - Body text: base-lg, primary font, regular
  - Quest cards: xl for titles, sm for descriptions

## Layout & Spacing
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20 for consistent rhythm
- Section padding: py-16 to py-24 desktop, py-12 mobile
- Card spacing: p-6 to p-8
- Grid gaps: gap-6 to gap-8
- Component margins: mb-12 to mb-16 between major sections

## Component Library

### Navigation
- **Fixed header**: Translucent dark background with blur effect
- Left: Logo with gradient icon treatment
- Center: Main nav (Tableau de bord, Quêtes, Roulette, Portfolio, Classement)
- Right: Wallet balance display + notification bell + profile avatar
- Mobile: Hamburger menu with slide-in drawer

### Hero Section (WITH LARGE IMAGE)
- **Full-width hero**: min-h-screen with background gradient overlay
- **Background image**: Abstract financial/tech visualization (stock charts transforming into game elements, particle effects)
- **Content layout**: 60/40 split - left weighted
  - Large headline: "Transformez vos investissements en aventure"
  - Subheading highlighting gamification benefits
  - Dual CTA buttons: "Commencer l'aventure" (primary, blurred background) + "Voir la démo"
  - Trust indicators: User count, total rewards distributed, average returns
- Stats bar overlay at bottom: Live counters for active quests, players online, rewards claimed today

### Dashboard Section
**Multi-column grid layout**:
- **Top row**: 4-column stats cards (Portfolio Value, Quests Completed, Level/XP Progress, Weekly Earnings)
- **Main area**: 2-column split
  - Left (60%): Interactive investment chart with quest markers overlaid, time range selector
  - Right (40%): Active quests sidebar - vertical card stack
- **Bottom row**: Recent achievements gallery (4-column grid, expandable)

### Quest Cards
- Card design: Elevated panels with gradient borders
- Content structure:
  - Top: Quest badge icon + difficulty level (stars/gems)
  - Title: Bold, display font
  - Objective description with progress bar
  - Reward display: XP + currency bonuses
  - Time remaining countdown
  - Accept/Continue button with glow effect
- Quest types: Daily (green accent), Weekly (blue), Special Event (purple/gold)

### Roulette Section
- **Center stage**: Large animated wheel component
  - 12-16 segments with varied rewards
  - Center spin button with pulsing glow
- **Surrounding elements**:
  - Top: Available spins counter + next free spin timer
  - Sides: 2-column recent winners feed (left) + reward preview cards (right)
  - Bottom: Spin history and probability information

### Feature Highlights
3-column grid showcasing platform benefits:
- Column 1: "Quêtes Quotidiennes" - Icon + description + example
- Column 2: "Récompenses Réelles" - Icon + description + stats
- Column 3: "Progression Continue" - Icon + description + leveling system preview
Each card includes illustration/icon, title, 2-3 sentence description, micro-interaction hover state

### Leaderboard/Social Section
- Tabbed interface: Global / Amis / Hebdomadaire
- Table layout with alternating row backgrounds:
  - Columns: Rank (with medal icons for top 3), Avatar, Username, Level, Points, Trend arrow
- User's own rank highlighted with distinct treatment
- Top performers showcase: 3-card podium layout above table

### Footer
**Comprehensive 4-column layout**:
- Column 1: Logo, tagline, social media icons
- Column 2: Produit (Features, Pricing, FAQ, Tutorials)
- Column 3: Communauté (Blog, Forum, Discord, Events)
- Column 4: Newsletter signup form + app download badges
- Bottom bar: Legal links, language selector, compliance badges

## Images Required
1. **Hero background**: Abstract financial tech visualization with particle effects, 1920x1080
2. **Dashboard charts**: Dynamic candlestick/line charts with quest milestone markers
3. **Quest badge icons**: Custom illustrated icons for different quest categories
4. **Achievement medals**: Trophy/badge graphics for accomplishments
5. **Profile avatars**: Gaming-style character portraits
6. **Roulette rewards**: Icon representations (coins, gems, bonus multipliers)

## Animations
- **Strategic only**: Roulette spin, XP bar fills, quest card reveals on scroll, number counters
- Smooth transitions for tab switching and modal overlays
- Subtle particle effects on hero background
- Progress indicators with smooth animations

## Visual Hierarchy
- Primary focus: Dashboard performance data and active quests
- Secondary: Gamification elements (roulette, achievements)
- Supporting: Community features and educational content
- Clear separation between financial data (credible, precise) and game elements (fun, engaging)