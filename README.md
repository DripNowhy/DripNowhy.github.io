This homepage is made by Yi Ding.

### Publication organization

The homepage defaults to All, with every paper shown in the same format: figure,
venue, title, authors, TL;DR, and links. Visitors can filter by Reasoning & RL,
Safety & Alignment, or Multimodal Fusion. Each article has a
`data-publication-topic` value (`reasoning`, `safety`, or `fusion`). Keep papers
in descending year order and update the static button counts when adding entries;
JavaScript also derives the counts from the articles. All papers remain visible
without JavaScript. Keep image width/height attributes accurate to reserve space
while images load, and retain the equal-contribution note in the section heading.

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
