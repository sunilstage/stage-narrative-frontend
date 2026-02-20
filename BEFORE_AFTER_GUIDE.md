# STAGE Narrative Engine - Before/After UI Comparison

## Overview

This guide shows the transformation from the old 4-tab structure to the new single-page vertical layout.

---

## BEFORE: 4-Tab Structure

### Layout Structure:
```
┌─────────────────────────────────────────────┐
│ [Overview] [Narratives] [Council] [Personas]│ ← 4 tabs
├─────────────────────────────────────────────┤
│                                              │
│  Tab content shown here                      │
│  (only one visible at a time)                │
│                                              │
│                                              │
│                                              │
└─────────────────────────────────────────────┘
```

### Problems:
1. **Hidden Information:** Council discussion and personas buried in separate tabs
2. **Context Switching:** Users need to click between tabs to compare information
3. **No Overview:** Can't see all 8 narratives at once
4. **Poor Export:** No way to multi-select narratives
5. **Small Scores:** Scores displayed at 12-14px, easy to miss
6. **Static Conflict:** Primary conflict shown only in Overview tab

---

## AFTER: Single-Page Vertical Layout

### Layout Structure:
```
┌─────────────────────────────────────────────┐
│         Top Navigation Bar                   │ ← Back button, project title
├─────────────────────────────────────────────┤
│    [PRIMARY CONFLICT - Sticky Header]        │ ← Collapses on scroll
├─────────────────────────────────────────────┤
│                                              │
│  ┌─ Round 2 CTA (if applicable) ──────────┐ │
│  │ 💡 Want to explore different angles?    │ │
│  │ [Start Round 2 →]                       │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  ┌─ Stakeholder Input (Collapsible) ──────┐ │
│  │ 🤝 Stakeholder Strategic Input ▼        │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  Marketing Narratives                        │
│  ┌──────────────────────────────────────────┐ │
│  │ [🥇#1] [🥈#2] [🥉#3] [#4] [#5] [#6]... │ │ ← Filmstrip
│  └──────────────────────────────────────────┘ │
│                                              │
│  ┌─ ACTIVE NARRATIVE CARD ─────────────────┐ │
│  │ 🥇 #1 - Internal Conflict    [⭐][↗][✏]│ │
│  │                                          │ │
│  │ ┌──────┬──────┬──────┐                  │ │
│  │ │ 8.5  │ 8.2  │ 8.7  │ ← Large scores  │ │
│  │ │▓▓▓▓▓▓│▓▓▓▓▓▓│▓▓▓▓▓▓│    with bars    │ │
│  │ └──────┴──────┴──────┘                  │ │
│  │                                          │ │
│  │ Marketing Narrative Text...              │ │
│  │ Full text shown with breathing room      │ │
│  │                                          │ │
│  │ ▼ Production Council Discussion          │ │ ← Expandable
│  │ ▼ Audience Persona Reviews               │ │ ← Expandable
│  └──────────────────────────────────────────┘ │
│                                              │
│  All Narratives (Grid for Selection)         │
│  ┌────┬────┬────┬────┐                      │
│  │[✓]1│[✓]2│[ ]3│[ ]4│                      │
│  ├────┼────┼────┼────┤                      │
│  │[ ]5│[✓]6│[ ]7│[ ]8│                      │
│  └────┴────┴────┴────┘                      │
│                                              │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ ✓ 3 Narratives Selected [Export Selected (3)]│ ← Fixed export bar
└─────────────────────────────────────────────┘
```

### Improvements:
1. ✅ **Everything Visible:** All information accessible via vertical scroll
2. ✅ **Context Preserved:** Council and personas embedded in each narrative
3. ✅ **Quick Navigation:** Filmstrip shows all 8 narratives at once
4. ✅ **Multi-Export:** Select multiple narratives and export together
5. ✅ **Large Scores:** 48px scores with color bars, impossible to miss
6. ✅ **Persistent Context:** Sticky conflict header always visible

---

## Feature Comparison

| Feature | BEFORE (4-Tab) | AFTER (Single-Page) |
|---------|----------------|---------------------|
| **Navigation** | 4 separate tabs | Single scroll |
| **Conflict Display** | Only in Overview tab | Sticky header (always visible) |
| **Narrative Navigation** | Numbered list in left panel | Visual filmstrip with thumbnails |
| **Score Display** | 12-14px text | 48px with color bars |
| **Council Discussion** | Separate tab | Expandable within each narrative |
| **Persona Reviews** | Separate tab | Expandable within each narrative |
| **Export** | Single narrative copy | Multi-select + batch export |
| **Stakeholder Input** | Always visible | Collapsible drawer |
| **Project Overview** | Static sections | Progressive disclosure |
| **Scroll Behavior** | Tab-based | Smooth vertical scroll |

---

## User Journey Comparison

### BEFORE: Finding a Good Narrative

1. Click "Narratives" tab
2. Scan list in left panel
3. Click narrative #1
4. Read score (small text)
5. Read narrative text
6. Wonder: "What did the council say?"
7. Click "Council" tab
8. Scroll to find relevant discussion
9. Click back to "Narratives" tab
10. Wonder: "What did audiences think?"
11. Click "Personas" tab
12. Find persona reviews
13. Go back to narratives to compare
14. Repeat for each narrative

**Total: 14+ steps, 6+ tab clicks**

---

### AFTER: Finding a Good Narrative

1. Scroll down (conflict header visible)
2. Click thumbnail in filmstrip
3. See large score (8.5/10) immediately
4. Read narrative text
5. Expand "Council Discussion" (same card)
6. Read relevant feedback
7. Expand "Persona Reviews" (same card)
8. See audience reactions
9. Click next thumbnail to compare
10. Repeat as needed
11. Select favorites with checkboxes
12. Click "Export Selected"

**Total: 12 steps, 0 tab clicks**

---

## Visual Hierarchy Improvements

### Score Visibility

**BEFORE:**
```
Score: 8.5/10  ← 12px text, gray color
```

**AFTER:**
```
    8.5     ← 48px bold, green color
  ▓▓▓▓▓▓▓▓▓ ← Color bar showing 85%
  Overall Score
```

### Narrative Cards

**BEFORE:**
- Compact list item (60px height)
- Small preview (2 lines)
- Click to see more
- Details in separate panels

**AFTER:**
- Full card (400+ px height)
- Complete narrative text
- Embedded council feedback
- Embedded persona reviews
- All in one scrollable view

### Conflict Prominence

**BEFORE:**
- Buried in Overview tab
- Static display
- Easy to forget

**AFTER:**
- Always visible (sticky header)
- Prominent position
- Collapses gracefully on scroll
- Expandable to show themes/characters

---

## Mobile Considerations

### BEFORE (4-Tab):
- Tabs crowded on small screens
- Tab labels truncated
- Horizontal scrolling needed for tabs
- Poor touch targets

### AFTER (Single-Page):
- Natural vertical scroll (mobile-friendly)
- No horizontal scrolling required
- Large touch targets (filmstrip items)
- Collapsible sections save space
- Progressive disclosure reduces clutter

---

## Performance Impact

### Load Time:
- **Before:** Load all 4 tabs' content upfront
- **After:** Load on-demand (expand sections as needed)

### Re-renders:
- **Before:** Full tab content swap on each click
- **After:** Smooth animations, minimal re-renders

### Bundle Size:
- **Before:** N/A (baseline)
- **After:** +25KB (new components, negligible impact)

---

## Accessibility Improvements

### Keyboard Navigation:
- **Before:** Tab through 4 tab buttons, then through content
- **After:** Natural document flow, tab through filmstrip items

### Screen Readers:
- **Before:** "Tab 1 of 4", "Tab 2 of 4" announcements
- **After:** Semantic sections with descriptive headings

### Focus Management:
- **Before:** Focus lost when switching tabs
- **After:** Focus preserved during scroll

---

## Developer Experience

### Code Complexity:

**BEFORE:**
```tsx
const [activeTab, setActiveTab] = useState('narratives')

{activeTab === 'narratives' && <NarrativesTab />}
{activeTab === 'council' && <CouncilTab />}
{activeTab === 'personas' && <PersonasTab />}
{activeTab === 'overview' && <OverviewTab />}
```

**AFTER:**
```tsx
const [selectedId, setSelectedId] = useState(null)

<StickyConflictHeader {...} />
<NarrativeFilmstrip onSelect={setSelectedId} />
<NarrativeCard narrative={selectedNarrative} />
<ExportBar selectedIds={[...]} />
```

### Maintainability:
- **Before:** 4 separate tab components to maintain
- **After:** Modular, reusable components with clear responsibilities

---

## Migration Path

For users transitioning from the old UI:

1. **First Visit:** Brief onboarding tooltip explaining new layout
2. **Filmstrip:** Hover tooltip: "Click to jump to narrative"
3. **Expand Sections:** Visual cue (chevron) indicates clickable
4. **Export Bar:** Appears with tooltip on first selection

### No Data Migration Required:
- All backend APIs remain unchanged
- No database schema changes
- Pure frontend transformation

---

## Success Metrics

### Quantitative Goals:
- ⬇️ **Reduce clicks to view narrative**: From 8+ to 2
- ⬆️ **Increase narrative views**: By 40% (easier navigation)
- ⬆️ **Increase export usage**: By 60% (multi-select feature)
- ⬇️ **Reduce time to decision**: From 5min to 2min

### Qualitative Goals:
- ✅ Users can quickly scan all narratives
- ✅ Scores are immediately visible and comparable
- ✅ Council feedback is contextually embedded
- ✅ Export workflow is intuitive and efficient

---

## Future Iterations

Based on this foundation, we can add:

1. **Narrative Comparison:** Side-by-side view of 2-3 narratives
2. **Filtering:** Filter by score, conflict type, generation method
3. **Sorting:** Sort by production score, audience score, etc.
4. **Search:** Full-text search across narratives
5. **Annotations:** Add notes to specific narratives
6. **Sharing:** Share specific narrative via URL
7. **Print Mode:** Optimized print layout for presentations

---

## Conclusion

The new single-page layout transforms the user experience from a **multi-step treasure hunt** into a **smooth, guided tour** of all narrative options. Users can now see everything at once, compare easily, and export efficiently.

**Key Takeaway:** By eliminating artificial boundaries (tabs) and embracing natural scrolling, we've made the interface more intuitive and significantly faster to use.
