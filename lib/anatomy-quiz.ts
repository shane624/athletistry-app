// Short knowledge-check per anatomy module. Index matches ANATOMY_MODULES.
// Two questions each — pass = both correct. Pure data, no I/O.

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index into options
}

export const ANATOMY_QUIZ: QuizQuestion[][] = [
  // 0 · Foundations
  [
    { q: "Which plane of movement is the plane of turnout?", options: ["Sagittal", "Frontal", "Transverse", "Vertical"], answer: 2 },
    { q: "In this course, 'mobility' means…", options: ["The range a joint has available", "The control you own inside that range", "Muscle size", "Bone density"], answer: 0 },
  ],
  // 1 · Feet & Ankle
  [
    { q: "How many bones are in the foot?", options: ["12", "19", "26", "33"], answer: 2 },
    { q: "Pointing the foot is…", options: ["Dorsiflexion", "Plantarflexion", "Pronation", "Eversion"], answer: 1 },
  ],
  // 2 · The Knees
  [
    { q: "A plié 'roll-in' (knee drifting inward) usually starts upstream at the…", options: ["Foot", "Hip", "Ankle", "Spine"], answer: 1 },
    { q: "In knee-dominant work, the knee should track over which toes?", options: ["The big toe", "The second and third toes", "The little toe", "The heel"], answer: 1 },
  ],
  // 3 · The Hips
  [
    { q: "Turnout comes primarily from the…", options: ["Foot", "Knee", "Hip", "Ankle"], answer: 2 },
    { q: "Which Great 8 pattern is the engine of jump power at the hip?", options: ["Squat", "Deadlift (hip hinge)", "Lunge", "Core"], answer: 1 },
  ],
  // 4 · Abdominals & Back
  [
    { q: "The core's main job is to…", options: ["Produce movement", "Resist movement", "Rotate the spine", "Flex the hip"], answer: 1 },
    { q: "The deep muscle that wraps the core 'canister' is the…", options: ["Rectus abdominis", "Transverse abdominis", "Erector spinae", "Diaphragm"], answer: 1 },
  ],
  // 5 · The Shoulders
  [
    { q: "Which structure holds the ball centred in the shoulder socket?", options: ["Deltoid", "Rotator cuff", "Trapezius", "Lats"], answer: 1 },
    { q: "'Shoulders down' is a cue to…", options: ["Depress and stabilise the scapula", "Lift the arms higher", "Shrug up", "Round the shoulders forward"], answer: 0 },
  ],
  // 6 · The Elbows
  [
    { q: "In ballet the elbow holds…", options: ["A locked straight line", "A sharp bend", "A soft, continuous curve", "A relaxed droop"], answer: 2 },
    { q: "Which muscles hold the elbow's curve (trained by pulls)?", options: ["Triceps", "Biceps and brachialis", "Deltoids", "Lats"], answer: 1 },
  ],
  // 7 · The Wrists
  [
    { q: "How many carpal bones are in the wrist?", options: ["5", "7", "8", "12"], answer: 2 },
    { q: "A trained wrist should be…", options: ["Stiff and locked", "Floppy", "Soft but alive, unbroken to the fingertips", "Fully flexed"], answer: 2 },
  ],
  // 8 · The Neck
  [
    { q: "Which muscles hold the head long and balanced?", options: ["Upper traps", "Deep neck flexors", "Sternocleidomastoid", "Suboccipitals"], answer: 1 },
    { q: "Roughly how heavy is the head?", options: ["2 kg", "5 kg", "8 kg", "10 kg"], answer: 1 },
  ],
  // 9 · Centre Synthesis
  [
    { q: "A jump's takeoff is a triple extension of…", options: ["Hip, knee, ankle", "Hip, spine, shoulder", "Knee, ankle, toe", "Hip, knee, spine"], answer: 0 },
    { q: "In the final two weeks before a performance, volume should…", options: ["Increase", "Ease off about 30%", "Stop completely", "Add maximum weight"], answer: 1 },
  ],
];
