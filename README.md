This homepage is made by Yi Ding.

### Publication distinctions

Place reusable `.pub-badge` elements alongside `.pub-venue` inside `.pub-meta`.
They wrap on narrow screens and support both light and dark themes. Use an
`<a>` for a linked ranking or announcement, or a `<span>` for a plain label.
For example, after a paper is selected for an Oral or Spotlight presentation:

```html
<div class="pub-meta">
    <span class="pub-venue">Conference Year</span>
    <span class="pub-badge">Oral</span>
    <!-- Use Spotlight instead of Oral when applicable. -->
</div>
```

For time-specific rankings, include the ranking date and link to the dated list.
