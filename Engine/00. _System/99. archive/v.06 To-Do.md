
# Goal
### The First Iteration: The "Discovery Kit"

A solid starter kit should provide a 360-degree view of the immediate area. Here is what should be in your generated file:

- **The Anchor (Location):** A grounded fantasy environment (e.g., a mountain pass or a sunken village).
    
- **The "Mural" View (Sensory):** 3 distinct details—something they smell, something they hear, and a dominant visual material/color (incorporating your architectural details).
    
- **The Point of Interest (Inspection):** One specific object in the immediate area that is "out of place" or historically significant.
    
- **The Pressure (Situation):** An "In-Media-Res" event that requires an immediate reaction (e.g., a tax dispute or an approaching storm).
    
- **The Cast (NPCs):** 2–3 individuals with a clear motivation and a "Social Taboo" they might accidentally break.
    
- **The Horizon (Leads):** 2 nearby locations or rumors that explain where they could go if they leave this spot.


# How To (Gemini)
### Step 1: Prepare the "Source Material" (Tables)

Before the button can work, it needs "paint" in the buckets. You need to ensure your tables in `_02. Tables` are formatted so Obsidian can read them.

- **Format Tables:** Every table needs a header and rows (Markdown format).
    
- **Assign Block IDs:** At the bottom of each table, add a unique ID (e.g., `^place-table` or `^npc-table`) so the script knows exactly where to look.
    

### Step 2: Build the "Blueprints" (Templates)

The generator won't just output text; it will create files. You need lean templates in `_03. Templates` for:

- **The Location Note:** A template that includes properties for environment and visual details.
    
- **The NPC Note:** A template with fields for motivation and social taboos.
    
- **The Discovery Kit Note:** A "Master" template that summarizes the rolls and links to the new files.
    

### Step 3: Write the "Logic" (Templater Script)

This is the "Engine" work. You will create a JavaScript-enabled template in your `_01. Procedures` or `_03. Templates` folder. This script will:

- **Roll the Dice:** Call your d20/d100 tables for the location, situation, and NPCs.
    
- **Create Files:** Use the `tp.file.create_new()` function to automatically generate the new Atlas and Cast notes in their respective folders.
    
- **Link Everything:** Embed those new files into a "Session Start" note so you don't have to hunt for them.
    

### Step 4: The "Trigger" (The Button)

Finally, you’ll place the actual button on your **04. Session States** dashboard.

- **Install Buttons Plugin:** Or use the "Metadata Menu" or "Commander" plugin to create a visual trigger.
    
- **Link to Script:** Set the button to "Run Templater Script: Generate Discovery Kit."
    

---


# How To (ChatGPT)

## Big picture (important)

You are not generating a “town.”  
You are executing a **Discovery Procedure** that _queries multiple table domains_ and assembles them into a single artifact.

So automation should look like:

> **One button → one procedure → multiple table calls → one composed note**

Not: one mega-table.

---

## Step 1: Treat the “Discovery Kit” as a procedure note, not a table

Create a **single procedure template**, something like:

/Procedures

  Discovery Kit – Generate.md

This note does _no_ content generation itself. It only:

- Calls tables
    
- Rolls dice
    
- Writes results into fixed slots
    

Think of it as a conductor, not a musician.

---

## Step 2: Map each Discovery Kit element to an existing table domain

Here’s the crucial alignment between your **folder structure** and your **Discovery Kit slots**:

### 1. The Anchor (Location)

**Source domain:**  
`03._Tables / 01. World Building / Place Generation`

- One roll
    
- Broad, grounded
    
- Sets physical reality
    

This table should return _place-scale nouns_, not descriptions.

---

### 2. The “Mural” View (Sensory)

**Source domains (3 calls):**

- `Atmospheric & Sensory` → smell
    
- `Atmospheric & Sensory` → sound
    
- `Architectural Details` → dominant material / color
    

Key insight:  
**These should be separate rolls**, even if they live in the same folder.

This prevents “samey” results and lets you swap sub-tables later.

---

### 3. The Point of Interest (Inspection)

**Source domains:**

- Primary: `In-world Art`
    
- Secondary fallback: `Myth & Folklore`
    

This table should _not_ explain itself.  
It should return an object with **implication**, not exposition.

Good automation rule:

- If result contains a “why,” discard and reroll
    
- Only “what” is allowed here
    

---

### 4. The Pressure (Situation)

**Source domain:**  
`03. Session Mechanics / Pressure`

This is your **clock starter**.

Important constraint:

- The table result must be _active now_
    
- No “will soon,” no “might happen”
    

If you ever hesitate whether a pressure requires action, the table failed.

---

### 5. The Cast (NPCs)

**Source domains (2–3 calls):**

- `02. Social / Sentient NPCs` (core identity + motivation)
    
- `02. Social / Quests & Problems` OR a dedicated **Social Taboo** table
    

Do **not** generate backstories here.

Each NPC entry should resolve to:

- Name / role
    
- Immediate want
    
- One taboo they might break _in front of the players_
    

This is _social volatility_, not lore.

---

### 6. The Horizon (Leads)

**Source domains:**

- `World Building / Place Generation`
    
- Optional overlay from `Myth & Folklore` or `Factions`
    

Two rolls only.  
These should _explain motion_, not promise quests.

Think: vectors, not hooks.

---

## Step 3: The Discovery Kit output note (what gets written)

When the button fires, it should generate **one new note** with a rigid layout:

# Discovery Kit – {{Anchor}}

  

## The Mural

- Smell:

- Sound:

- Dominant Material / Color:

  

## Point of Interest

- …

  

## Pressure

- …

  

## Cast

- NPC 1:

- NPC 2:

- NPC 3 (optional):

  

## Horizon

- Lead A:

- Lead B:

This rigidity is a feature.  
It trains your table to _read_ situations quickly.

---

## Step 4: How the button thinks (conceptually)

Your button does **one thing**:

> “Execute the Discovery Kit procedure.”

Behind the scenes (conceptually):

1. Roll once on Place Generation
    
2. Roll 3 times on sensory / architectural tables
    
3. Roll once on Inspection table
    
4. Roll once on Pressure
    
5. Roll 2–3 times on NPC + Taboo tables
    
6. Roll twice on Horizon tables
    
7. Write results into a new note using the fixed layout
    

You are composing _across folders_, not within one.

That’s the power of your structure.

---

## Step 5: Why your current folder layout already supports this

Your table folders are divided by **semantic axis**, not usage:

- World Building → what exists
    
- Social → who reacts
    
- Session Mechanics → what forces action
    

That’s exactly what a Discovery Kit needs.

You do **not** need to reorganize anything.  
You just need one orchestrator template that knows where to look.

---

## Step 6: Design rule that will save you later

> **Tables never know why they’re being used.  
> Procedures know.**

Do not tailor tables specifically “for Discovery Kits.”  
Let the procedure choose _which_ tables to call.

That keeps:

- Tables reusable
    
- Procedures composable
    
- Automation sane
    

---

## Final framing (important)

What you’re building is not content automation.  
It’s **situation assembly**.

The Discovery Kit is the moment the world snaps into focus around the players — sensory, social, mechanical, directional — all at once.

Your structure already supports this beautifully.  
The next step, when you’re ready, is to define **failure states** for Discovery Kits (when to reroll, when to escalate, when to add a tarot pull).

But structurally? You’re already standing on solid ground.

