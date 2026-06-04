tailwind.config = {
  theme: { extend: {
    fontFamily: {
      serif:  ['"Cormorant Garamond"','Georgia','serif'],
      mono:   ['"DM Mono"','monospace'],
      hand:   ['Caveat','cursive'],
    },
    colors: {
      parch: { 50:'#fefbf4', 100:'#faf3e0', 200:'#f2e4c0', 300:'#e6d09a', 400:'#d4b86a' },
      ink:   { DEFAULT:'#1a120a', soft:'#3d2e1e', mid:'#6b5240', muted:'#9c7e62', faint:'#c4a882' },
      spine: { DEFAULT:'#1e1108', dark:'#120b04', mid:'#3a2510', light:'#5a3a1a' },
      ruby:  { DEFAULT:'#9b2335', light:'#c4394e', dark:'#6b1522', glow:'rgba(155,35,53,0.25)' },
      sage:  { DEFAULT:'#2d5a3d', light:'#4a8a60', dark:'#1a3a27', glow:'rgba(45,90,61,0.2)' },
      amber: { DEFAULT:'#b8720a', light:'#d4982a', dark:'#7a4c06', glow:'rgba(184,114,10,0.2)' },
      steel: { 300:'#c8c8c8', 400:'#a0a0a0', 500:'#686868', 600:'#484848' },
    },
  }}
}