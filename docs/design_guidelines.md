---
name: design-guide
description: Modern UI design principles and guidelines for building clean, professional interfaces. Use this skill when creating any UI component, web page, React component, HTML artifact, or interface design. Ensures consistent spacing, typography, color usage, and professional aesthetic. Apply these principles to buttons, forms, cards, layouts, dashboards, landing pages, and all visual interfaces.
---

# Design Guide

Comprehensive design principles for creating modern, professional user interfaces. Apply these guidelines to every UI component, web page, and interactive element.

## Core Design Principles

### Minimalism and Whitespace
- Embrace whitespace - let elements breathe
- Avoid cluttered layouts with too many elements competing for attention
- Each section should have clear visual separation
- Use padding generously to create comfortable, readable layouts

### Color System
- **Base palette**: Use grays (#F9FAFB, #F3F4F6, #E5E7EB, #D1D5DB) and off-whites as foundation
- **Accent color**: Select ONE accent color and use it sparingly for CTAs, links, and highlights
- **Text colors**: #111827 for primary text, #6B7280 for secondary text, #9CA3AF for tertiary
- **NEVER use**: Generic purple/blue gradients, rainbow gradients, or multiple competing accent colors
- **Backgrounds**: Prefer white (#FFFFFF) or light gray (#F9FAFB) for main backgrounds

### Spacing System (8px Grid)
Use consistent spacing values based on 8px increments:
- **8px**: Tight spacing within components (icon to text)
- **16px**: Standard element spacing (between form fields, list items)
- **24px**: Medium section spacing (card padding)
- **32px**: Large section spacing (between major sections)
- **48px**: Extra large spacing (hero sections, major dividers)
- **64px**: Hero spacing (page margins, major section breaks)

Never use arbitrary values like 15px or 37px. Stick to the 8px grid for consistency.

### Typography Hierarchy
- **Minimum body text**: 16px - never go smaller for paragraph text
- **Maximum fonts**: Use no more than 2 font families (one for headings, one for body)
- **Clear hierarchy**:
  - H1: 48px, font-weight: 700 (page titles)
  - H2: 32px, font-weight: 600 (section headers)
  - H3: 24px, font-weight: 600 (subsection headers)
  - Body: 16px, font-weight: 400, line-height: 1.6
  - Small: 14px, font-weight: 400 (captions, labels)
- **Line height**: 1.5-1.6 for body text, 1.2-1.3 for headings
- **Letter spacing**: Default for body, -0.02em for large headings

### Shadows and Depth
- Use subtle shadows to indicate elevation and interactivity
- **Light shadow**: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` for cards
- **Medium shadow**: `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` for hover states
- **Heavy shadow**: `box-shadow: 0 10px 15px rgba(0,0,0,0.1)` for modals and dropdowns
- Avoid excessive shadows, overly dark shadows, or multiple shadows on one element

### Border Radius
- **Small radius**: 4px for inputs, small buttons
- **Medium radius**: 8px for cards, larger buttons
- **Large radius**: 16px for modals, hero sections
- Not everything needs to be rounded - mix rounded and sharp corners for visual interest
- Use consistent radius values throughout the design

### Interactive States
Every interactive element must have clear visual feedback:
- **Hover**: Slight color change, shadow increase, or opacity shift
- **Active/Pressed**: Slightly darker color, shadow decrease
- **Disabled**: Reduced opacity (0.5-0.6), gray colors, cursor: not-allowed
- **Focus**: Visible outline or ring (2px accent color outline with offset)

### Mobile-First Approach
- Design for mobile screens first (320px-768px)
- Progressive enhancement for tablet (768px-1024px) and desktop (1024px+)
- Ensure touch targets are minimum 44x44px
- Stack elements vertically on mobile, use grid/flex on larger screens
- Test all interactions work on touch devices

## Component Guidelines

### Buttons
**Structure:**
```css
padding: 12px 24px;
font-size: 16px;
font-weight: 500;
border-radius: 8px;
border: none;
cursor: pointer;
transition: all 0.2s ease;
```

**Primary button:**
- Background: Accent color
- Text: White
- Hover: Darken background by 10%
- Shadow: `0 2px 4px rgba(0,0,0,0.1)`
- Hover shadow: `0 4px 8px rgba(0,0,0,0.15)`

**Secondary button:**
- Background: Transparent
- Border: 2px solid accent color
- Text: Accent color
- Hover: Background = accent color, text = white

**Ghost button:**
- Background: Transparent
- Text: Gray-600
- Hover: Background = gray-100

**Never:**
- Use gradients on buttons
- Make buttons smaller than 44x44px
- Omit hover states
- Use all-caps text

### Cards
**Structure:**
```css
background: white;
border-radius: 12px;
padding: 24px;
```

**Choose ONE:**
- Subtle border: `border: 1px solid #E5E7EB`
- Subtle shadow: `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`

**Never use both border and shadow** - it's visually cluttered.

**Content spacing:**
- Card padding: 24px
- Title to content: 16px
- Content sections: 16px
- Card to card margin: 24px

### Forms
**Input fields:**
```css
padding: 12px 16px;
font-size: 16px;
border: 1px solid #D1D5DB;
border-radius: 6px;
background: white;
transition: border-color 0.2s;
```

**States:**
- Focus: `border-color: accent, outline: 2px solid accent with offset`
- Error: `border-color: #EF4444, background: #FEF2F2`
- Disabled: `background: #F3F4F6, cursor: not-allowed`

**Labels:**
- Position: Above input with 8px margin
- Font size: 14px
- Font weight: 500
- Color: #374151

**Error messages:**
- Color: #EF4444
- Font size: 14px
- Margin-top: 8px
- Include error icon if space allows

**Field spacing:**
- Between fields: 16px
- Between field groups: 32px
- Form padding: 24px

### Navigation
**Header/Navbar:**
- Height: 64px (desktop), 56px (mobile)
- Padding: 16px 24px
- Background: White with subtle shadow or transparent with blur
- Logo: Left-aligned, max height 32px
- Links: Right-aligned, 16px font, 24px spacing

**Sidebar:**
- Width: 240px-280px
- Item height: 40px
- Item padding: 12px 16px
- Active state: Background = gray-100, accent left border (4px)
- Hover: Background = gray-50

### Typography in Components
**Headings:**
- Section titles: 24px, font-weight 600
- Card titles: 18px, font-weight 600
- Subheadings: 16px, font-weight 500

**Body text:**
- Paragraphs: 16px, line-height 1.6
- Lists: 16px, 8px spacing between items
- Captions: 14px, color gray-600

**Always maintain proper contrast ratio** (4.5:1 minimum for body text).

## Layout Patterns

### Container Widths
- **Max width**: 1280px for main content
- **Centered**: Use `margin: 0 auto` for centered layouts
- **Padding**: 24px (mobile), 48px (desktop) on sides

### Grid Systems
```css
display: grid;
gap: 24px;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

Use CSS Grid for complex layouts, Flexbox for simple alignments.

### Spacing Between Sections
- Between major sections: 64px (desktop), 48px (mobile)
- Between subsections: 32px
- Between paragraphs: 16px

## Anti-Patterns (AVOID)

### Color Mistakes
- ❌ Rainbow gradients
- ❌ Multiple accent colors competing for attention
- ❌ Low contrast text (gray on light gray)
- ❌ Pure black (#000000) text on white - use #111827 instead
- ❌ Neon or overly bright colors

### Spacing Mistakes
- ❌ Inconsistent spacing (15px here, 18px there, 22px elsewhere)
- ❌ Elements touching edges without padding
- ❌ Cramped layouts with insufficient whitespace
- ❌ Excessive spacing that disconnects related elements

### Typography Mistakes
- ❌ Text smaller than 16px for body content
- ❌ Using 3+ different fonts
- ❌ All uppercase body text (headers only)
- ❌ Insufficient line height causing cramped reading
- ❌ Overly long line lengths (>75 characters per line)

### Component Mistakes
- ❌ Buttons with no hover state
- ❌ Clickable elements that don't look clickable
- ❌ Form inputs with no focus state
- ❌ Cards with both borders AND shadows
- ❌ Touch targets smaller than 44x44px
- ❌ Gradient backgrounds on interactive elements

### Layout Mistakes
- ❌ Not responsive on mobile devices
- ❌ Horizontal scrolling on small screens
- ❌ Inconsistent alignment (center, then left, then center again)
- ❌ Too many competing focal points

## Quick Checklist

Before finalizing any UI, verify:

1. **Color**: One accent color used sparingly, neutral base palette, no gradients
2. **Spacing**: All spacing values are multiples of 8px
3. **Typography**: Body text ≥16px, clear hierarchy, max 2 fonts
4. **Shadows**: Subtle and consistent, not overdone
5. **Interactivity**: All interactive elements have hover/focus/disabled states
6. **Mobile**: Responsive design, touch targets ≥44x44px
7. **Contrast**: Text meets WCAG contrast requirements
8. **Consistency**: Same patterns used throughout (button styles, card styles, etc.)

## Implementation Notes

When building components:
1. Start with the core structure and spacing
2. Apply typography hierarchy
3. Add colors (grayscale first, then accent)
4. Implement interactive states
5. Add subtle shadows and borders
6. Test on mobile sizes
7. Verify consistency with other components

**Remember**: Professional design comes from consistency and restraint, not from adding more colors or effects. When in doubt, simplify.
