<!-- This file contains the AGENTS.md content provided by the user -->
<!-- See the full AGENTS.md for complete guidelines -->

# CommonGround — Project Rules

## Key Design Rules
- KEEP THE STRUCTURE SWISS-CLEAN; MAKE THE PERSONALITY HAND-DRAWN.
- BLACK AND WHITE CREATE THE WORLD. COLOR MARKS WHAT MATTERS. IMPERFECTION MAKES IT HUMAN.
- ~85-90% neutral, ~10-15% accent
- NO gradients, NO glassmorphism, NO excessive shadows, NO neon effects

## Color System
### Light Mode
- --bg: #F7F6F2
- --surface: #FFFFFF
- --text: #111111
- --muted: #6F6F6A
- --border: #191919

### Dark Mode
- --bg: #0D0D0D
- --surface: #171717
- --text: #F7F6F2
- --muted: #A6A49D
- --border: #F7F6F2

### Accents
- --yellow: #FFD43B
- --blue: #4D7CFE
- --pink: #FF72B6
- --red: #FF5C5C
- --green: #5BCB77
- --orange: #FF914D
- --purple: #9B72FF

AGENTS.md — CommonGround

1. PROJECT IDENTITY

Project: CommonGround

Tagline: Find your people, not just hobbies.

CommonGround is a hobby discovery and community platform for college students and young adults.

The product helps users:

1. Discover hobbies
2. Identify interests they genuinely care about
3. Discover communities around those interests
4. Explore conversations and projects
5. Participate and eventually connect with people offline

Core philosophy

CommonGround is NOT a social network.

People do not come to CommonGround primarily to post their lives, collect followers, or consume an infinite feed.

They come because they are interested in something.

The fundamental product loop is:

DISCOVER
    ↓
INTEREST
    ↓
COMMUNITY
    ↓
PARTICIPATION
    ↓
PEOPLE

The product should always prioritize shared interests and meaningful participation over social metrics.

⸻

2. CURRENT PROJECT SCOPE

This is currently a frontend-first prototype.

Current constraints

* 4-person team
* Approximately 12 days for the prototype
* React + JSX
* HTML/CSS
* Framer Motion
* React Router
* Local/mock data
* No production backend required for V1

Do not over-engineer.

Do not introduce infrastructure that does not contribute directly to the prototype.

The architecture should remain easy to connect to a real backend later.

⸻

3. V1 PRODUCT SCOPE

Required

Explore

Users can browse without creating an account.

They can discover:

* Hobbies
* Categories
* Communities
* Trending interests

⸻

Hobby Discovery

The signature onboarding interaction.

Users swipe through hobby cards.

Actions:

* Swipe right / interested
* Swipe left / skip
* Button controls
* Progress indicator

Selected hobbies become the user’s interests.

⸻

Ground

Personalized home screen based on selected interests.

Ground should surface:

* Selected interests
* Relevant communities
* Interesting discussions
* Activity around interests
* Related hobbies
* Opportunities for discovery

Ground is not an infinite social media feed.

⸻

Communities

Communities exist around interests.

A community contains:

* Name
* Description
* Interest
* Member count
* Posts
* Discussions
* People
* Related interests

A community can become dormant when inactive.

Do not treat inactivity as deletion.

⸻

Posts

Users can create:

* Discussions
* Questions
* Ideas
* Project/showcase posts

Posts can contain:

* Text
* Images
* Interest tags

Posts belong to interests.

⸻

Profile

Profiles communicate:

* Who the person is
* What they enjoy
* What they want to try
* What communities they participate in

Profiles should NOT emphasize popularity.

Avoid:

* Followers
* Following
* Like counts as status
* Engagement scores
* Vanity metrics

⸻

4. FUTURE FEATURES

These are intentionally NOT V1 features.

V2

* Chat
* Events
* Workshops
* Online communities
* Community activity tools

V3

* Maps
* Local discovery
* Mentors
* Hobby circles
* Offline meetups
* Location-based recommendations

Do not implement these unless explicitly requested.

Do not add placeholder UI for future features unless it contributes to the current prototype.

⸻

5. PRODUCT ARCHITECTURE

The fundamental conceptual model is:

INTEREST
   ↓
COMMUNITY
   ↓
ACTIVITY
   ↓
PEOPLE

An interest exists independently from a community.

Example:

Photography
│
├── Photography Community
├── Street Photography
├── Film Photography
└── Portrait Photography

Do not create complicated automatic community-generation logic in V1.

Use predefined/mock interests and communities.

The eventual product may use keyword/topic clustering to organize communities, but this is not part of the current prototype.

⸻

6. DESIGN PHILOSOPHY

Core visual concept

CommonGround should feel like:

A playful digital sketchbook that happens to be a sophisticated community platform.

The experience should feel:

* Exciting
* Exploratory
* Human
* Curious
* Slightly weird
* Clean
* Modern
* Playful
* Professional underneath the personality

The user should want to ask:

“What’s next?”

⸻

7. PRIMARY DESIGN RULE

KEEP THE STRUCTURE SWISS-CLEAN; MAKE THE PERSONALITY HAND-DRAWN.

Structure

Should be:

* Precise
* Grid-based
* Responsive
* Consistent
* Easy to scan
* Professionally spaced

Personality

Should come from:

* Doodles
* Hand-drawn elements
* Bold colors
* Illustrations
* Motion
* Unexpected visual details

Never sacrifice usability for decoration.

⸻

8. COLOR SYSTEM

Light Mode

--bg: #F7F6F2;
--surface: #FFFFFF;
--text: #111111;
--muted: #6F6F6A;
--border: #191919;

Dark Mode

--bg: #0D0D0D;
--surface: #171717;
--text: #F7F6F2;
--muted: #A6A49D;
--border: #F7F6F2;

Accent Colors

--yellow: #FFD43B;
--blue: #4D7CFE;
--pink: #FF72B6;
--red: #FF5C5C;
--green: #5BCB77;
--orange: #FF914D;
--purple: #9B72FF;

Rules

* NO gradients
* NO glassmorphism
* NO excessive shadows
* NO neon effects
* NO excessive use of accent colors
* Avoid pure white/black where warm neutrals are more appropriate
* Accent colors should pop against the monochrome foundation

Target visual ratio:

~85–90% neutral
~10–15% accent

Color should feel like a marker stroke on a black-and-white sketch.

⸻

9. VISUAL MOTIFS

These motifs have semantic meaning.

Do not use them randomly.

Chessboard

Represents:

Common ground / different things meeting

Use for:

* Decorative backgrounds
* Hero sections
* Section headers
* Transitions
* Empty states

Keep it subtle.

⸻

Sunflowers

Represent:

Discovery / growth / something coming alive

Use for:

* Hobby discovery completion
* Joining a community
* Success states
* Active communities
* Decorative moments

A sunflower may bloom as an interaction.

⸻

Stairs

Represent:

Progress / exploration

Possible progression:

Discover
   ↓
Explore
   ↓
Join
   ↓
Participate
   ↓
Create

Do not replace every progress indicator with stairs.

Use them where they reinforce the concept.

⸻

Smileys

Represent:

Human warmth

Use for:

* Empty states
* Success states
* Small reactions
* Friendly microcopy

They should feel hand-drawn and charming, not childish.

⸻

Doodles

Allowed visual elements:

* Scribbled circles
* Arrows
* Stars
* Underlines
* Hand-drawn shapes
* Small illustrations
* Imperfect geometric elements

Use sparingly.

⸻

10. TYPOGRAPHY

Primary font:

Prefer:

* Inter
* Geist
* DM Sans

Use whichever is already available/configured.

Secondary handwritten font may be used for:

* Annotations
* Decorative copy
* Doodles
* Small visual accents

Possible choices:

* Caveat
* Patrick Hand
* Comic Neue

Do NOT use handwritten typography for normal navigation or body copy.

⸻

11. SHAPE LANGUAGE

Use soft edges.

Recommended:

Cards:       18–24px
Containers:  24–28px
Buttons:     12–16px
Inputs:      12–16px

Do not make everything pill-shaped.

Use occasional sharper/square elements to create contrast.

⸻

12. ANIMATION SYSTEM

Use Framer Motion.

Motion should communicate:

* Discovery
* Feedback
* Progress
* Interaction
* Connection

Do not animate everything.

If everything moves, nothing feels important.

⸻

Standard page entrance

Use a subtle combination of:

opacity: 0 → 1
y: 12 → 0
scale: 0.98 → 1

Use spring or ease-based transitions depending on context.

⸻

Cards

Hover:

y: -4 to -6px
scale: 1.01 to 1.03

Keep subtle.

⸻

Buttons

Hover:

scale: 1.02–1.03

Tap:

scale: 0.96–0.98

⸻

Hobby cards

This is the most expressive animation in the product.

Use:

* Drag gestures
* Rotation based on drag direction
* Spring physics
* Stacked cards
* Exit animations
* Next-card reveal

Swiping right should feel positive.

Swiping left should feel dismissive but playful.

⸻

Shared transitions

Use Framer Motion layoutId where appropriate.

Example:

A community card can visually transition into the community page.

The interface should feel spatially connected.

⸻

13. RESPONSIVE DESIGN

This is a web application.

Support:

* Desktop
* Laptop
* Tablet
* Mobile

Do not simply shrink desktop layouts.

Desktop

Use a spacious canvas with strong grid structure.

Mobile

Use:

* Bottom navigation
* Full-width content
* Reduced decorative elements
* Touch-friendly controls

Maintain the same visual language across breakpoints.

⸻

14. NAVIGATION

Primary navigation:

Ground
Explore
Create
Profile

Desktop can use a top navigation or compact side navigation only if it improves the design.

Mobile should use bottom navigation.

Do NOT create a large traditional dashboard sidebar.

⸻

15. COMPONENT PRINCIPLES

Prefer reusable components.

Suggested structure:

src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── BottomNav.jsx
│   │   └── PageCanvas.jsx
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── InterestTag.jsx
│   │   ├── SketchArrow.jsx
│   │   ├── Sunflower.jsx
│   │   ├── Smiley.jsx
│   │   └── ChessPattern.jsx
│   │
│   ├── hobby/
│   │   ├── HobbyCard.jsx
│   │   ├── HobbyDeck.jsx
│   │   └── SwipeControls.jsx
│   │
│   ├── community/
│   │   ├── CommunityCard.jsx
│   │   ├── CommunityHeader.jsx
│   │   ├── CommunityPost.jsx
│   │   └── CommunityGrid.jsx
│   │
│   └── profile/
│       ├── HobbyProfile.jsx
│       └── JourneySteps.jsx
│
├── pages/
│   ├── Landing.jsx
│   ├── Explore.jsx
│   ├── Onboarding.jsx
│   ├── Ground.jsx
│   ├── Community.jsx
│   ├── CreatePost.jsx
│   └── Profile.jsx
│
├── data/
│   ├── hobbies.js
│   ├── communities.js
│   ├── posts.js
│   └── users.js
│
├── animations/
│   └── variants.js
│
└── App.jsx

Adjust this structure if the project already has an established architecture.

Do not unnecessarily rewrite working code.

⸻

16. STATE MANAGEMENT

For V1, local React state is sufficient.

Use localStorage where persistence improves the prototype.

Persist:

* Theme
* Selected hobbies
* Joined communities
* Basic profile state

Do not introduce Redux or another global state library unless the project genuinely requires it.

Keep state simple.

⸻

17. MOCK DATA

Mock data should feel real.

Avoid:

Lorem ipsum
Test Community
User 123
Post 1

Use believable hobby communities and conversations.

Example:

Photography
"Anyone interested in doing a street photography walk this weekend?"
"I've been shooting on my phone for months. Should I finally get a camera?"
"How do you approach photographing strangers?"

The content should sound like real students and young adults.

⸻

18. ACCESSIBILITY

Maintain:

* Good color contrast
* Keyboard accessibility
* Visible focus states
* Accessible labels
* Alt text
* Touch-friendly controls
* Reduced-motion support where practical

Do not rely exclusively on color to communicate state.

⸻

19. CODE QUALITY

When implementing:

* Prefer small reusable components
* Avoid unnecessary duplication
* Keep data separate from UI
* Use semantic HTML
* Keep animation logic centralized where practical
* Avoid giant JSX files
* Use meaningful variable names
* Keep CSS/design tokens centralized
* Avoid hardcoding the same visual values repeatedly
* Do not introduce dependencies without a reason

Do not rewrite unrelated parts of the project when implementing a feature.

⸻

20. AI USAGE

AI may be used in future versions for:

* Recommendations
* Interest clustering
* Community organization
* Discovery

However:

CommonGround is NOT an AI-first product.

Do not put “AI-powered” into UI copy.

Do not add unnecessary AI features simply because an API is available.

The product’s value comes from:

People + interests + communities.

⸻

21. DO NOT BUILD

Unless explicitly requested, do not add:

* Chat
* Maps
* Mentors
* Workshops
* Payments
* AI recommendation engines
* Follower systems
* Likes as a popularity metric
* Leaderboards
* Streaks
* XP
* Notifications
* Contact importing
* Relationship tracking
* Complex backend infrastructure

These belong to future versions.

⸻

22. PRODUCT DIFFERENTIATION

CommonGround should NOT feel like:

Instagram

Because it is not a general social feed.

Reddit

Because communities are not anonymous discussion boards.

Discord

Because the core experience isn’t chat.

Facebook Groups

Because discovery and exploration are central.

Pinterest

Because the core unit isn’t visual inspiration.

Meetup

Because CommonGround begins with discovering interests and people, then eventually expands into offline experiences.

⸻

23. THE CORE EXPERIENCE

Every major design decision should support this:

"I don't know what I'm interested in."
                ↓
"I found something interesting."
                ↓
"Oh, other people like this too."
                ↓
"These people are doing interesting things."
                ↓
"I want to participate."

If a feature does not strengthen this journey, question whether it belongs in V1.

⸻

24. QUALITY BAR

The final prototype should feel:

* Distinctive
* Polished
* Responsive
* Fast
* Cohesive
* Human
* Playful
* Professional
* Curious

It should feel like a product someone could genuinely imagine using.

Avoid the visual quality of a generic AI-generated dashboard.

Do not fill space simply because space exists.

Whitespace is intentional.

⸻

25. DEVELOPMENT RULE

Before implementing a new feature:

1. Understand the existing architecture.
2. Check whether a reusable component already exists.
3. Reuse the existing design tokens.
4. Reuse the existing animation vocabulary.
5. Keep the feature consistent with the CommonGround visual language.
6. Avoid unnecessary dependencies.
7. Test desktop and mobile behavior.
8. Check light and dark mode.
9. Check keyboard/accessibility behavior where relevant.
10. Do not break existing functionality.

⸻

26. WHEN MAKING DESIGN DECISIONS

If there are multiple technically valid options, prefer the one that is:

1. Simpler
2. More reusable
3. More responsive
4. More visually distinctive
5. More consistent with CommonGround
6. Easier for another developer to understand

Do not optimize for complexity.

⸻

27. FINAL DESIGN MANTRA

Keep this visible while developing:

KEEP THE STRUCTURE SWISS-CLEAN; MAKE THE PERSONALITY HAND-DRAWN.

And:

BLACK AND WHITE CREATE THE WORLD.
COLOR MARKS WHAT MATTERS.
IMPERFECTION MAKES IT HUMAN.

The user should open CommonGround and think:

“What is this?”

Then:

“I want to explore.”

Then:

“Oh. These are my people.”
