// The Athletistry Movement Map — a self-assessment that finds the movement
// PATTERN behind a dancer's corrections. 5 tests → points toward 6 types →
// a primary type + a secondary tendency. Pure module (client/server safe).

export type TypeId = "gripper" | "rangeChaser" | "hiker" | "twister" | "collapser" | "controller";

export interface MovementType {
  id: TypeId;
  name: string;
  tagline: string;        // for the shareable card
  superpower: string;
  blindspot: string;
  pattern: string;        // the pattern making ballet harder
  message: string;        // the one-line reframe
  corrections: string[];  // 3 corrections they probably hear on repeat
  stopObsessing: string;  // one correction to temporarily stop chasing
  oneExercise: string;    // one thing to try today
  focus: string;          // the area to train
  pathway: { label: string; href: string; why: string }; // next Athletistry step
  grad: string;           // brand gradient for the card
}

export const MOVEMENT_TYPES: Record<TypeId, MovementType> = {
  gripper: {
    id: "gripper", name: "The Gripper", tagline: "I don't need more effort — I need somewhere to put it.",
    superpower: "Determined, strong, and able to hold difficult positions.",
    blindspot: "You create stability through unnecessary tension.",
    pattern: "You stabilise by gripping — toes, jaw, standing leg, arms — so positions feel locked and hard to move out of.",
    message: "You don't need more effort. You need somewhere better to direct it.",
    corrections: ["“Relax your shoulders”", "“Stop gripping the floor”", "“Soften your standing leg”"],
    stopObsessing: "Trying harder. More effort is feeding the tension, not fixing it.",
    oneExercise: "Foot doming — gently lift your arch without curling your toes. Find pressure without grip.",
    focus: "Efficient strength, foot pressure, and breathing.",
    pathway: { label: "The Practice", href: "/programs", why: "Anatomy-first strength so stability comes from structure, not tension." },
    grad: "linear-gradient(135deg,#1f2a44,#3a4a6b)",
  },
  rangeChaser: {
    id: "rangeChaser", name: "The Range Chaser", tagline: "I have the movement. Now I build the support.",
    superpower: "Mobile, ambitious, and visually expressive.",
    blindspot: "You reach for range before organising support.",
    pattern: "You have the flexibility — but you access it before the support is set, so shapes look big and then wobble.",
    message: "Your flexibility isn't the problem. The order you use it in is.",
    corrections: ["“Control your extension”", "“Keep your hips square”", "“Use your core”"],
    stopObsessing: "Getting your leg higher. Height isn't the missing piece — support is.",
    oneExercise: "Slow développé to knee height only, holding the pelvis completely still the whole way.",
    focus: "Standing-leg stability and controlling transitions.",
    pathway: { label: "Train for Ballet + strength", href: "/ballet", why: "Build the stability that makes your range usable." },
    grad: "linear-gradient(135deg,#3a4a6b,#27ae9f)",
  },
  hiker: {
    id: "hiker", name: "The Hiker", tagline: "My body is helping too much.",
    superpower: "Powerful legs and strong movement initiation.",
    blindspot: "You recruit the pelvis and shoulders to help the limbs.",
    pattern: "Your trunk helps your limbs — the hip hikes in passé, the shoulders lift in port de bras.",
    message: "Your body is helping too much — let the limbs work on their own.",
    corrections: ["“Shoulders down”", "“Level your hips”", "“Don't lift with your shoulder”"],
    stopObsessing: "Lifting higher. The height is coming from your pelvis or shoulder, not the working muscles.",
    oneExercise: "Passé holds at a lower knee height, keeping both hips dead level — separate the leg from the trunk.",
    focus: "Separating limb movement from the trunk; core and pelvis control.",
    pathway: { label: "Progress + core work", href: "/progress", why: "Pelvis and shoulder separation so the limbs move on their own." },
    grad: "linear-gradient(135deg,#1f2a44,#27ae9f)",
  },
  twister: {
    id: "twister", name: "The Twister", tagline: "Turnout is a conversation between both legs.",
    superpower: "Excellent visual understanding of ballet positions.",
    blindspot: "You create the look of turnout by rearranging the pelvis, feet, or spine.",
    pattern: "Your turnout is built from the shape — one leg rotates more, the pelvis spirals, the foot rolls — rather than from both hips.",
    message: "Turnout is a conversation between both legs, not a pose made by the feet.",
    corrections: ["“Even out your turnout”", "“Stop rolling your foot”", "“Square your hips”"],
    stopObsessing: "Forcing more turnout from the floor. Faking it downstream is the pattern itself.",
    oneExercise: "Banded external rotation on both legs — feel equal rotation coming from each hip.",
    focus: "True hip rotation, evenly, from both sides.",
    pathway: { label: "Train for Ballet — turnout & hips", href: "/ballet", why: "Hip external-rotation strength so turnout comes from the hip." },
    grad: "linear-gradient(135deg,#3a4a6b,#1f8b7f)",
  },
  collapser: {
    id: "collapser", name: "The Collapser", tagline: "I need strength that travels with me.",
    superpower: "Fluidity, softness, and a natural movement quality.",
    blindspot: "You lose pressure and organisation during transitions.",
    pattern: "You move beautifully but lose the structure in the transitions — sinking into plié, dropping turnout as you close, softening in the standing hip.",
    message: "You don't need to become rigid. You need strength that travels with you.",
    corrections: ["“Don't sink in your plié”", "“Keep your turnout as you close”", "“Lift out of your hip”"],
    stopObsessing: "Stiffening to look 'stronger'. The fix is control through the movement, not rigidity.",
    oneExercise: "A slow, controlled close to fifth — hold even foot pressure and rotation the whole way in.",
    focus: "Strength that holds through range and transitions.",
    pathway: { label: "Strength & endurance programs", href: "/programs", why: "Strength that stays with you through the movement, not just in a pose." },
    grad: "linear-gradient(135deg,#2bb3a2,#1f8b7f)",
  },
  controller: {
    id: "controller", name: "The Controller", tagline: "Now it needs to become a pattern, not a command.",
    superpower: "Precise, thoughtful, and technically disciplined.",
    blindspot: "You try to consciously manage every body part at once.",
    pattern: "You understand every correction — but you run them as commands, so technique holds slowly and breaks when speed increases.",
    message: "You understand the correction. Now it needs to become a pattern rather than a command.",
    corrections: ["“Stop overthinking it”", "“Let it flow”", "“Trust your training”"],
    stopObsessing: "Managing every part in the moment. The goal is a pattern that runs on its own.",
    oneExercise: "Drill one cue at a time until it's automatic, then add speed — let it become reflex.",
    focus: "Turning conscious corrections into automatic patterns.",
    pathway: { label: "The Practice", href: "/programs", why: "Repeatable, guided patterns so technique holds up at speed." },
    grad: "linear-gradient(135deg,#1f2a44,#3a4a6b)",
  },
};

export const TYPE_ORDER: TypeId[] = ["gripper", "rangeChaser", "hiker", "twister", "collapser", "controller"];

export interface MapTest {
  key: string;
  title: string;
  move: string;          // the ballet movement to do
  watch: string;         // what to look for (stands in for the comparison clip)
  options: { label: string; type: TypeId }[];
}

// Each option maps to the movement type its sign points to (from the Movement Map).
export const MAP_TESTS: MapTest[] = [
  {
    key: "foot", title: "The Foot Pressure Test", move: "A slow demi-plié and rise.",
    watch: "Watch your feet as you lower and lift. Where does your base go?",
    options: [
      { label: "My toes curl or grip to feel stable", type: "gripper" },
      { label: "My foot rolls inward and I lose the outer edge", type: "twister" },
      { label: "I sink or shift back and lose my heel connection", type: "collapser" },
      { label: "My feet are mobile but I don't feel much pressure into the floor", type: "rangeChaser" },
      { label: "I have to think through every part to keep it organised", type: "controller" },
    ],
  },
  {
    key: "turnout", title: "The Turnout Transfer Test", move: "A tendu to the side and back in.",
    watch: "Notice your turnout and your pelvis as the leg moves out and back.",
    options: [
      { label: "One leg turns out more than the other", type: "twister" },
      { label: "My pelvis shifts or hikes to help the leg", type: "hiker" },
      { label: "Big turnout shape, but the rotation isn't stable", type: "rangeChaser" },
      { label: "I lose turnout as the leg moves", type: "collapser" },
      { label: "My standing leg goes rigid to hold it", type: "gripper" },
    ],
  },
  {
    key: "fifth", title: "The Fifth Position Test", move: "A slow close into a tight fifth.",
    watch: "As you close, what gives way first?",
    options: [
      { label: "I soften the standing leg or sink to get there", type: "collapser" },
      { label: "I lose rotation or my foot rolls as I close", type: "twister" },
      { label: "I pull the foot back with a lot of tension", type: "gripper" },
      { label: "I can make the shape but can't feel the floor doing the work", type: "rangeChaser" },
      { label: "I have to consciously manage each part to close cleanly", type: "controller" },
    ],
  },
  {
    key: "passe", title: "The Passé Balance Test", move: "A controlled retiré (passé) balance.",
    watch: "Find your balance in passé. What is holding you up?",
    options: [
      { label: "My hip hikes, or I lift the knee instead of the foot", type: "hiker" },
      { label: "I grip the standing leg hard", type: "gripper" },
      { label: "I sink into the standing hip", type: "collapser" },
      { label: "Good height, but my trunk isn't organised over the foot", type: "rangeChaser" },
      { label: "I'm managing every body part at once", type: "controller" },
    ],
  },
  {
    key: "portdebras", title: "The Port de Bras Test", move: "Slowly raise and lower your arms.",
    watch: "Raise and lower the arms slowly. What moves that shouldn't?",
    options: [
      { label: "My shoulders rise with my elbows", type: "hiker" },
      { label: "My elbows collapse as my shoulders lower", type: "collapser" },
      { label: "My arms feel stiff or over-held", type: "gripper" },
      { label: "My ribs move instead of my arms", type: "rangeChaser" },
      { label: "My neck overworks and I'm managing it consciously", type: "controller" },
    ],
  },
];

export interface MapResult {
  primary: TypeId;
  secondary: TypeId;
  scores: Record<TypeId, number>;
}

/** Tally the 5 answers (parallel to MAP_TESTS) into a primary + secondary type. */
export function scoreMovementMap(answers: (TypeId | null)[]): MapResult {
  const scores = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0])) as Record<TypeId, number>;
  for (const a of answers) if (a) scores[a] += 1;
  const ranked = [...TYPE_ORDER].sort((a, b) => scores[b] - scores[a]);
  return { primary: ranked[0], secondary: ranked[1], scores };
}
