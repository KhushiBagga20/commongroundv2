import type { Connection } from './types'

/** Undirected edges of the Rabbit Hole. `because` is shown on the string between two stickers. */
export const CONNECTIONS: Connection[] = [
  // photography
  { a: 'photography', b: 'filmmaking', because: 'both are about framing light' },
  { a: 'photography', b: 'astronomy', because: 'long exposures of the night sky' },
  { a: 'photography', b: 'graphic-design', because: 'composition is composition' },
  { a: 'photography', b: 'writing', because: 'every photo is a tiny story' },
  { a: 'photography', b: 'travel', because: 'a camera is the best excuse to wander' },
  { a: 'photography', b: 'birdwatching', because: 'bird photographers are a whole tribe' },
  { a: 'photography', b: 'zines', because: 'photo zines are the classic first zine' },

  // coding
  { a: 'coding', b: 'robotics', because: 'give your code a body' },
  { a: 'coding', b: 'game-dev', because: 'games are code that’s fun on purpose' },
  { a: 'coding', b: 'generative-art', because: 'art made of algorithms' },
  { a: 'coding', b: 'music-production', because: 'music tech and live coding' },
  { a: 'coding', b: 'electronics', because: 'microcontrollers bridge the two' },
  { a: 'coding', b: 'chess', because: 'people build their own chess engines' },
  { a: 'coding', b: 'speedcubing', because: 'algorithms, quite literally' },

  // look
  { a: 'filmmaking', b: 'music-production', because: 'every film needs a score' },
  { a: 'filmmaking', b: 'writing', because: 'it starts with a script' },
  { a: 'filmmaking', b: 'field-recording', because: 'sound design is half of film' },
  { a: 'filmmaking', b: 'skateboarding', because: 'skate videos are a whole art form' },
  { a: 'filmmaking', b: 'dance', because: 'dance films move twice' },
  { a: 'drawing', b: 'graphic-design', because: 'sketch first, digitise later' },
  { a: 'drawing', b: 'calligraphy', because: 'it’s all pen control' },
  { a: 'drawing', b: 'zines', because: 'comics zines are the best zines' },
  { a: 'drawing', b: 'game-dev', because: 'pixel art and concept art' },
  { a: 'drawing', b: 'tabletop-rpg', because: 'draw your characters and maps' },
  { a: 'drawing', b: 'birdwatching', because: 'field sketching slows you down' },
  { a: 'graphic-design', b: 'zines', because: 'layout is the whole game' },
  { a: 'graphic-design', b: 'generative-art', because: 'designs that design themselves' },
  { a: 'graphic-design', b: 'calligraphy', because: 'custom lettering' },
  { a: 'graphic-design', b: 'skateboarding', because: 'deck graphics are iconic' },
  { a: 'calligraphy', b: 'writing', because: 'handwritten words hit harder' },
  { a: 'zines', b: 'writing', because: 'words need somewhere to live' },
  { a: 'zines', b: 'sewing', because: 'stitch-bound zines' },
  { a: 'zines', b: 'origami', because: 'it’s all folded paper' },

  // tinker
  { a: 'robotics', b: 'electronics', because: 'motors, sensors, circuits' },
  { a: 'robotics', b: 'origami', because: 'folding robots are real' },
  { a: 'game-dev', b: 'tabletop-rpg', because: 'game design without a screen' },
  { a: 'game-dev', b: 'music-production', because: 'chiptune soundtracks' },
  { a: 'game-dev', b: 'writing', because: 'branching stories' },
  { a: 'generative-art', b: 'music-production', because: 'audio-reactive visuals' },
  { a: 'generative-art', b: 'knitting', because: 'patterns are code for yarn' },
  { a: 'generative-art', b: 'origami', because: 'math you can hold' },
  { a: 'electronics', b: 'music-production', because: 'build your own synth' },
  { a: 'electronics', b: 'field-recording', because: 'homemade contact mics' },

  // noise
  { a: 'music-production', b: 'djing', because: 'make the tracks, then play them' },
  { a: 'music-production', b: 'guitar', because: 'record your riffs' },
  { a: 'music-production', b: 'field-recording', because: 'sample the whole world' },
  { a: 'guitar', b: 'writing', because: 'songwriting' },
  { a: 'guitar', b: 'woodworking', because: 'luthiers build guitars by hand' },
  { a: 'djing', b: 'dance', because: 'read the floor from both sides' },
  { a: 'field-recording', b: 'birdwatching', because: 'recording birdsong' },
  { a: 'field-recording', b: 'travel', because: 'a sound map of every trip' },

  // make
  { a: 'pottery', b: 'sourdough', because: 'hands in the mix, long waits, hot ovens' },
  { a: 'pottery', b: 'gardening', because: 'throw pots for your plants' },
  { a: 'pottery', b: 'woodworking', because: 'making things you actually use' },
  { a: 'pottery', b: 'coffee', because: 'make the mug, then the coffee' },
  { a: 'knitting', b: 'sewing', because: 'textile people find each other' },
  { a: 'sewing', b: 'dance', because: 'make your own costumes' },
  { a: 'woodworking', b: 'electronics', because: 'enclosures for your gadgets' },

  // move
  { a: 'bouldering', b: 'running', because: 'cross-training buddies' },
  { a: 'bouldering', b: 'skateboarding', because: 'falling is part of the sport' },
  { a: 'bouldering', b: 'chess', because: 'route-reading is problem solving' },
  { a: 'running', b: 'cycling', because: 'endurance besties' },
  { a: 'dance', b: 'juggling', because: 'rhythm, flow and timing' },
  { a: 'cycling', b: 'travel', because: 'bikepacking' },
  { a: 'cycling', b: 'coffee', because: 'café rides are a sacred tradition' },
  { a: 'juggling', b: 'speedcubing', because: 'muscle-memory obsessions' },

  // taste
  { a: 'sourdough', b: 'fermentation', because: 'a starter is a ferment' },
  { a: 'sourdough', b: 'coffee', because: 'the breakfast specialists' },
  { a: 'coffee', b: 'writing', because: 'fuel for the morning pages' },
  { a: 'fermentation', b: 'gardening', because: 'pickle your harvest' },
  { a: 'fermentation', b: 'foraging', because: 'wild ferments' },

  // wander
  { a: 'astronomy', b: 'coding', because: 'simulating orbits' },
  { a: 'astronomy', b: 'writing', because: 'sci-fi starts by looking up' },
  { a: 'astronomy', b: 'travel', because: 'dark-sky road trips' },
  { a: 'birdwatching', b: 'foraging', because: 'both reward slow walks' },
  { a: 'gardening', b: 'foraging', because: 'know your plants' },
  { a: 'gardening', b: 'birdwatching', because: 'plant for pollinators and birds' },
  { a: 'travel', b: 'language-learning', because: 'menus without pointing' },
  { a: 'travel', b: 'writing', because: 'travel journals' },

  // think
  { a: 'chess', b: 'speedcubing', because: 'pattern recognition' },
  { a: 'chess', b: 'tabletop-rpg', because: 'strategy around a table' },
  { a: 'tabletop-rpg', b: 'writing', because: 'worldbuilding' },
  { a: 'writing', b: 'language-learning', because: 'words in more flavours' },
]
