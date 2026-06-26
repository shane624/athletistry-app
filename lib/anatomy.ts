// "The Dancer's Body" — anatomy course content. Pure data module so the page
// can render it in the app's brand. 10 region modules, each with the four-lesson
// rhythm: anatomy, biomechanics, ballet, functional strength.

export interface AnatomyModule {
  region: string;
  essence: string;
  g8: string;            // the Great 8 pattern it maps to
  chips: string[];       // ballet terms
  anatomy: string;       // may contain <b> only
  biomech: string;
  ballet: string;
  fnTitle: string;
  fnLead: string;
  ex: string[];          // may contain <b>
}

export const ANATOMY_MODULES: AnatomyModule[] = [
  {
    region: "Foundations", essence: "Planes of movement and the anatomical terms the rest of the course is written in.",
    g8: "Movement vocabulary",
    chips: ["Sagittal plane", "Frontal plane", "Transverse plane", "Turnout lives here"],
    anatomy: "The body is described from the <b>anatomical position</b>: upright, facing forward, palms forward. Learn the directional pairs — anterior and posterior, medial and lateral, proximal and distal — because they're the precise language that lets you fix a fault rather than guess at it.",
    biomech: "Three planes govern movement. <b>Sagittal</b> is forward and back (tendu devant, plié). <b>Frontal</b> is side to side (tendu à la seconde). <b>Transverse</b> is rotation — the plane of turnout, and the one most dancers never train directly.",
    ballet: "Every step is a blend of planes. The course also sets the working verbs you'll use throughout: flexion, extension, abduction, adduction, rotation, and the concentric, eccentric, and isometric ways a muscle works.",
    fnTitle: "Mobility and stability",
    fnLead: "This module builds no exercise yet. It builds the idea that governs them all.",
    ex: ["<b>Mobility</b> is the range a joint has available", "<b>Stability</b> is the control you own inside that range", "The course trains controlled range, not just more range"],
  },
  {
    region: "Feet & Ankle", essence: "Where the floor meets the dancer — the most overworked, under-trained region in most bodies.",
    g8: "Foundation of squat, lunge, deadlift",
    chips: ["Cou-de-pied", "Relevé", "Tendu", "Positions of the feet", "Frappé"],
    anatomy: "The foot holds <b>26 bones</b> arranged into three arches — a suspension system that stores and returns energy. <b>Intrinsic</b> muscles control fine articulation; <b>extrinsic</b> muscles, chiefly the gastrocnemius and soleus through the Achilles, drive the point.",
    biomech: "Pointing is plantarflexion, flexing is dorsiflexion. Weight should sit across the <b>tripod</b>: big-toe base, little-toe base, heel. Rolling in (pronation) loses the tripod and the foundation for everything above it.",
    ballet: "Home of the positions of the feet, cou-de-pied, the articulation of a tendu, and the strike of a frappé. Every relevé is a concentric calf contraction; every controlled lowering is an eccentric one.",
    fnTitle: "Functional strength",
    fnLead: "Not a pattern on its own. The foot is the base beneath the squat, lunge, and deadlift, plus dedicated ankle work.",
    ex: ["<b>Eccentric calf raises</b> — four to five seconds down, the control landings demand", "<b>Foot doming</b> to wake the intrinsics and arches", "<b>Single-leg relevé balance</b> — the bridge from gym to studio"],
  },
  {
    region: "The Knees", essence: "A hinge between the two most powerful regions in the body — paying for whatever the hip and foot fail to do.",
    g8: "Squat + Lunge",
    chips: ["Plié", "Fondu", "Frappé", "Landing from jumps"],
    anatomy: "The knee is two joints: the <b>tibiofemoral</b> hinge and the <b>patellofemoral</b> kneecap track. Four ligaments (ACL, PCL, MCL, LCL) and two menisci hold and cushion it. The quadriceps extend it and guide the kneecap; the hamstrings flex it.",
    biomech: "Built to flex and extend in line with the foot. When the knee drifts inward while the foot stays put, you get a twisting load it can't absorb — the classic plié roll-in. The cause is almost always upstream at the hip.",
    ballet: "The centre of the plié, demi and grand — a turned-out squat and the foundation of every jump. It runs the fondu's melt and recovery, the frappé's snap, and the absorption of every landing.",
    fnTitle: "Functional strength",
    fnLead: "The knee-dominant patterns, with knees tracking over the second and third toes.",
    ex: ["<b>Squat</b> — strength parallel to the plié, 2:0:2 tempo, hypertrophy then strength", "<b>Lunge</b> — unilateral, exposes and corrects the left-to-right imbalance every dancer carries", "<b>Eccentric step-downs</b> — landing mechanics in slow motion"],
  },
  {
    region: "The Hips", essence: "Where ballet is actually generated. Turnout, extension, the height of a battement, the line of an arabesque.",
    g8: "Deadlift",
    chips: ["Rond de jambe", "Développé", "Grand battement", "Arabesque", "Attitude", "Retiré", "Turnout"],
    anatomy: "A <b>ball-and-socket</b> built for range. Turnout comes from the <b>deep six external rotators</b>. Extension comes from the glutes, flexion from the iliopsoas, side stability from gluteus medius and minimus, and control from the adductors.",
    biomech: "The single most important fact in the course: <b>turnout comes from the hip, not the foot.</b> It's rotation in the transverse plane. Forcing it from the floor fakes the rotation downstream, and the knees and ankles pay for it.",
    ballet: "Rond de jambe is circumduction, développé is controlled flexion, grand battement is ballistic flexion and extension. Arabesque, attitude, and retiré are the held shapes. Turnout — the thing that defines the line — is hip work start to finish.",
    fnTitle: "Functional strength",
    fnLead: "The hip hinge is the engine of jump power and développé control.",
    ex: ["<b>Deadlift</b> — hip-hinge power that translates into jumps, strength phase of 3 to 5 reps", "<b>Single-leg deadlift</b> — the standing-leg stability an arabesque needs", "<b>Banded external rotation</b> — direct work for the turnout muscles"],
  },
  {
    region: "Abdominals & Back", essence: "The core lets every other region do its job. Nothing in the limbs is stable until the centre is.",
    g8: "Core",
    chips: ["Placement", "Pirouette centre", "Cambré", "Control of extensions"],
    anatomy: "Picture a canister. Walls of rectus abdominis, obliques, and the deep <b>transverse abdominis</b>. A back wall of erector spinae and multifidus. A lid (the diaphragm) and a floor (the pelvic floor). Together they create the pressure that stabilises the spine.",
    biomech: "The core's job is to <b>resist</b> movement, not produce it. Anti-extension keeps an arabesque out of the lower back. Anti-rotation holds your centre through a turn. 'Pulling up' is length and pressure, not sucking the stomach in.",
    ballet: "The quiet author of placement, the stable column a pirouette turns around, the control behind every extension, and the chosen articulation of a cambré or deep port de bras.",
    fnTitle: "Functional strength",
    fnLead: "Trained the way it works — by resisting rather than just flexing. Keep it in the endurance range.",
    ex: ["<b>Plank</b> and progressions — the canister holding under length", "<b>Dead bug</b> — développé control rehearsed on the floor", "<b>Pallof press</b> — your pirouette centre trained directly", "<b>Side plank</b> — the side wall that holds you over the standing leg"],
  },
  {
    region: "The Shoulders", essence: "The arms read as effortless, which hides how much work they do. Most mobile joint, least stable.",
    g8: "Vertical & horizontal push and pull",
    chips: ["Positions of the arms", "Port de bras", "Épaulement", "Carriage"],
    anatomy: "The <b>glenohumeral</b> ball-and-socket has a shallow socket, buying range at the cost of stability. The <b>rotator cuff</b> holds the ball centred; the deltoids, trapezius, serratus, and lats move the arm and scapula.",
    biomech: "Arm and shoulder blade move together in <b>scapulohumeral rhythm</b>. The cue 'shoulders down' means depress and stabilise the scapula so the neck stays long and the arm floats from a quiet base.",
    ballet: "Home of the positions of the arms, port de bras, and épaulement. The demand is endurance and control: the arms rarely lift heavy, but they hold shape for long stretches.",
    fnTitle: "Functional strength",
    fnLead: "All four upper-body patterns live here. Bias the pulls for dance carriage.",
    ex: ["<b>Vertical push</b> — shoulder and military press", "<b>Vertical pull</b> — pull-ups and lat pulldowns", "<b>Horizontal push</b> — push-ups and bench", "<b>Horizontal pull</b> — rows, the 'shoulders down' muscles"],
  },
  {
    region: "The Elbows", essence: "A small joint with a large job: the difference between an arm that looks lengthened and one that looks bent.",
    g8: "Push & pull — the working hinge",
    chips: ["The arm's curve", "Soft elbow", "Forearm rotation"],
    anatomy: "A <b>hinge</b> for bending and straightening, paired with the radioulnar joint that rotates the forearm. Biceps and brachialis flex it; triceps extends it; the biceps also turns the palm up.",
    biomech: "In ballet the elbow is never locked and never sharply bent. It holds a soft, continuous curve — an active hold rather than a relaxed droop. Locked looks rigid; collapsed looks tired; trained holds the middle.",
    ballet: "Shapes every position of the arms: the round of first, the lift of fifth, the open line of second. 'Lengthened, not bent' is really an instruction about how the elbow carries its curve.",
    fnTitle: "Functional strength",
    fnLead: "Already trained inside every push and pull. A little direct work builds the stamina to hold a shaped arm.",
    ex: ["<b>Pulls</b> train the biceps and brachialis that hold the curve", "<b>Pushes</b> train the triceps that stop the arm collapsing", "<b>Light curls and extensions</b> — endurance for a long adagio"],
  },
  {
    region: "The Wrists", essence: "The last link in the arm, and the one that either completes the classical line or interrupts it.",
    g8: "Stability & grip under load",
    chips: ["The living wrist", "Port de bras finish"],
    anatomy: "Eight small <b>carpal bones</b> meet the forearm at the radiocarpal joint, moved by the forearm flexors and extensors — the same muscles that run grip.",
    biomech: "The wrist flexes, extends, and deviates side to side. Its job is to continue the arm's line without breaking it. Too floppy breaks the line; too stiff kills it. Trained, it's soft but alive — unbroken to the fingertips.",
    ballet: "Completes every position of the arms and every port de bras, finishing the line a fraction after the elbow — the quality dancers call a breathing arm.",
    fnTitle: "Functional strength",
    fnLead: "A stabiliser inside the upper-body patterns, not a pattern of its own. Supplementary, not heavy.",
    ex: ["<b>Push patterns</b> load the wrist into supported extension", "<b>Pull patterns</b> load grip — wrist and forearm", "<b>Loaded carries</b> for forearm endurance and a controlled, alive hand"],
  },
  {
    region: "The Neck", essence: "The neck holds the head, and the head leads the body. Tension here corrupts everything below it.",
    g8: "Neutral neck under load",
    chips: ["Épaulement", "Spotting", "Head carriage"],
    anatomy: "The <b>cervical spine</b> — seven vertebrae. The <b>deep neck flexors</b> hold the head long and balanced; the upper traps, levator scapulae, sternocleidomastoid, and suboccipitals move and tension it.",
    biomech: "The head is heavy — roughly five kilograms — at the very top of the chain. Balanced cleanly, the neck stays long and quiet. Poked forward, every muscle overworks, which reads as tension and breaks the line from crown to tailbone.",
    ballet: "Creates épaulement, runs the spot in every pirouette, and sets the head carriage in arabesque and attitude. Long neck, level chin: a request for a balanced, quiet head.",
    fnTitle: "Functional strength",
    fnLead: "Not a pattern. Trained through position and endurance, and through the postural chain.",
    ex: ["<b>Neutral neck</b> in every deadlift, squat, and press", "<b>Deep neck flexor</b> nods and holds, so the head balances", "<b>Upper-back strength</b> — the rows that hold the neck tall"],
  },
  {
    region: "Centre Synthesis", essence: "The barre isolates. The centre integrates. The whole chain working at once, in pirouettes and jumps.",
    g8: "The full chain",
    chips: ["Pirouettes", "Jumps", "Power up", "Control down"],
    anatomy: "Nothing new here. This module assembles the nine regions you've already built into the two movements where every part has to work together.",
    biomech: "A <b>pirouette</b> is a chain: feet hold the relevé, hip and knee stabilise the column, the core resists the rotation it generates, the arms set the turn, and the neck spots. A clean turn is a well-built chain, not a gift.",
    ballet: "A <b>jump</b> is the deadlift, squat, and calf raise made explosive and landed under control. Takeoff is a triple extension of hip, knee, and ankle; landing is eccentric absorption in reverse. Power up and control down are both built in the gym.",
    fnTitle: "Put it on a calendar",
    fnLead: "Apply the workshop's planning structure to your own year.",
    ex: ["<b>Macro</b> — the year: mark performances and the condition each needs", "<b>Meso</b> — 8 to 12 weeks: build, then ease volume 30% in the final two weeks", "<b>Micro</b> — 2-week blocks adjusted from your tracking: reps, sets, weight, time, RPE"],
  },
];
