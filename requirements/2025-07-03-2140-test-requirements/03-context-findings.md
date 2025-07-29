# Context Findings

## Codebase Analysis Summary

### Architecture Overview

- **Backend**: Node.js/Express with MongoDB (though we'll use file-based storage)
- **Frontend**: HTML/CSS/JavaScript with modular architecture
- **Testing**: Jest framework (separate from our requirements collection)
- **UI Pattern**: Accessibility-first, mobile-responsive design

### Key Files for Integration

#### HTML Templates

- `index.html` - Main landing page with advanced features
- `senior-ui.html` - Senior-friendly interface (good reference for accessibility)
- `index-unified.html` - Unified interface supporting multiple themes
- `test-buttons.html` - Simple testing interface

#### CSS Architecture

- `styles/` - Modular CSS structure:
  - `components/forms.css` - Form styling patterns
  - `components/buttons.css` - Button styles
  - `components/cards.css` - Card/container patterns
  - `components/modals.css` - Modal patterns
  - `base/variables.css` - CSS custom properties
- `styles.css` - Main comprehensive stylesheet
- `senior-styles.css` - Senior-specific accessibility styles

#### JavaScript Patterns

- `script.js` - Modal creation and form handling
- `senior-ui.js` - Accessibility features (voice, font size)
- `js/theme-switcher.js` - Theme management

### Existing UI Patterns

#### Form Pattern

```html
<form class="form-group">
  <div class="form-group">
    <label for="field-id" class="form-label required">Field Name</label>
    <input type="text" id="field-id" class="form-input" required />
    <div class="form-help">Helper text</div>
    <div class="form-error">Error message</div>
  </div>
</form>
```

#### Button Hierarchy

- `.btn-primary` - Main call-to-action
- `.btn-secondary` - Secondary actions
- `.btn-lg` - Large buttons for accessibility
- Minimum 44px height for touch-friendly interaction

#### Card/Container Pattern

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

### CSS Custom Properties System

- Comprehensive color scheme with `--primary-color`, `--secondary-color`
- Responsive font sizes: `--font-size-base: 1rem` to `--font-size-xl: 1.5rem`
- Consistent spacing: `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- Senior-friendly overrides available

### Accessibility Features

- Focus indicators with 3px outline
- High contrast ratios
- Large touch targets (44px minimum)
- Text-to-speech support in senior UI
- Font size controls
- Keyboard navigation support

### File Structure for New Feature

Should integrate with existing patterns:

- Create `test-requirements.html` following card pattern
- Use existing CSS classes from `styles/components/`
- Follow mobile-first responsive design
- Implement file-based storage via JavaScript blob download

### Technical Constraints

- No database integration (file-based storage)
- No Jest integration
- Single-user workflow
- Simple web interface for non-technical users
- Should follow existing Korean UI patterns and accessibility standards

### Related Features Analysis

- The signup forms in `senior-ui.html` show multi-step form patterns
- Modal system in `script.js` shows overlay patterns
- Theme switcher shows preference management
- Form validation patterns are established

### Implementation Hints

1. Use existing card pattern for main container
2. Leverage form patterns from `styles/components/forms.css`
3. Follow accessibility patterns from senior-ui for inclusive design
4. Implement JSON export for file-based storage
5. Use existing color scheme and typography system
6. Follow mobile-first responsive approach
