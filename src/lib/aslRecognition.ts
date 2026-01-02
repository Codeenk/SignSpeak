import { NormalizedLandmarkList } from "@mediapipe/hands";

export interface ASLSign {
  letter: string;
  description: string;
  instruction: string;
  imageUrl: string;
}

// Complete A-Z ASL alphabet with real hand sign reference images
export const aslAlphabet: ASLSign[] = [
  { letter: "A", description: "Fist with thumb beside index finger", instruction: "Make a fist with thumb resting on the side of your index finger", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/a.gif" },
  { letter: "B", description: "Flat hand, fingers together, thumb tucked", instruction: "Hold hand flat with fingers together pointing up, thumb tucked in palm", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/b.gif" },
  { letter: "C", description: "Curved hand forming C shape", instruction: "Curve fingers and thumb to form the letter C shape", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/c.gif" },
  { letter: "D", description: "Index up, others touch thumb", instruction: "Point index finger up, other fingers curl to touch thumb tip", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/d.gif" },
  { letter: "E", description: "All fingers curled, thumb across", instruction: "Curl all fingers into palm, thumb tucked across fingertips", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/e.gif" },
  { letter: "F", description: "Index and thumb touch, others up", instruction: "Touch index and thumb tips together, other fingers extended", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/f.gif" },
  { letter: "G", description: "Index and thumb parallel, pointing", instruction: "Point index finger sideways, thumb parallel underneath", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/g.gif" },
  { letter: "H", description: "Index and middle out, pointing side", instruction: "Extend index and middle fingers pointing sideways together", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/h.gif" },
  { letter: "I", description: "Pinky up, others closed", instruction: "Make a fist with only pinky finger extended upward", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/i.gif" },
  { letter: "J", description: "Pinky up, trace J shape", instruction: "Start with I sign, then trace a J motion with pinky", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/j.gif" },
  { letter: "K", description: "Index up, middle out, thumb between", instruction: "Index and middle fingers up in V, thumb between them", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/k.gif" },
  { letter: "L", description: "L shape with thumb and index", instruction: "Extend thumb and index finger to form an L shape", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/l.gif" },
  { letter: "M", description: "Thumb under three fingers", instruction: "Tuck thumb under index, middle, and ring fingers", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/m.gif" },
  { letter: "N", description: "Thumb under two fingers", instruction: "Tuck thumb under index and middle fingers only", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/n.gif" },
  { letter: "O", description: "Fingers curved to meet thumb", instruction: "Curve all fingers to meet thumb, forming an O", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/o.gif" },
  { letter: "P", description: "Like K but pointing down", instruction: "Make K sign but point fingers downward", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/p.gif" },
  { letter: "Q", description: "Like G but pointing down", instruction: "Make G sign but point fingers downward", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/q.gif" },
  { letter: "R", description: "Cross index over middle", instruction: "Cross index finger over middle finger, others closed", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/r.gif" },
  { letter: "S", description: "Fist with thumb over fingers", instruction: "Make a fist with thumb wrapped over fingers", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/s.gif" },
  { letter: "T", description: "Thumb between index and middle", instruction: "Tuck thumb between index and middle fingers in fist", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/t.gif" },
  { letter: "U", description: "Index and middle up together", instruction: "Extend index and middle fingers together pointing up", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/u.gif" },
  { letter: "V", description: "Index and middle in V shape", instruction: "Make peace sign with index and middle fingers spread", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/v.gif" },
  { letter: "W", description: "Three fingers up spread", instruction: "Extend index, middle, ring fingers spread apart", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/w.gif" },
  { letter: "X", description: "Index finger hooked", instruction: "Make fist with index finger bent/hooked", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/x.gif" },
  { letter: "Y", description: "Thumb and pinky out", instruction: "Extend thumb and pinky, other fingers closed", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/y.gif" },
  { letter: "Z", description: "Index traces Z in air", instruction: "Point index finger and trace Z shape in air", imageUrl: "https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/z.gif" },
];

// Optimized finger extension detection with caching
interface FingerState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

// Landmark indices
const WRIST = 0;
const THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

// Optimized distance calculation
const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const distance3D = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Check if finger is extended (optimized)
const getFingerState = (landmarks: NormalizedLandmarkList): FingerState => {
  const wrist = landmarks[WRIST];
  
  // Thumb - check if tip is extended away from palm
  const thumbExtended = landmarks[THUMB_TIP].x < landmarks[THUMB_IP].x - 0.02 ||
    distance(landmarks[THUMB_TIP], landmarks[INDEX_MCP]) > distance(landmarks[THUMB_IP], landmarks[INDEX_MCP]);
  
  // Other fingers - tip higher than PIP joint (extended)
  const indexExtended = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y - 0.02;
  const middleExtended = landmarks[MIDDLE_TIP].y < landmarks[MIDDLE_PIP].y - 0.02;
  const ringExtended = landmarks[RING_TIP].y < landmarks[RING_PIP].y - 0.02;
  const pinkyExtended = landmarks[PINKY_TIP].y < landmarks[PINKY_PIP].y - 0.02;
  
  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };
};

// Check if finger is curled
const isFingerCurled = (landmarks: NormalizedLandmarkList, tipIdx: number, pipIdx: number, mcpIdx: number): boolean => {
  return landmarks[tipIdx].y > landmarks[pipIdx].y && landmarks[tipIdx].y > landmarks[mcpIdx].y - 0.05;
};

// Check if two landmarks are close (touching)
const areTouching = (landmarks: NormalizedLandmarkList, idx1: number, idx2: number, threshold = 0.06): boolean => {
  return distance(landmarks[idx1], landmarks[idx2]) < threshold;
};

// Check if finger is hooked/bent
const isFingerHooked = (landmarks: NormalizedLandmarkList, tipIdx: number, dipIdx: number, pipIdx: number): boolean => {
  const tipY = landmarks[tipIdx].y;
  const dipY = landmarks[dipIdx].y;
  const pipY = landmarks[pipIdx].y;
  return tipY > dipY && dipY < pipY; // DIP is highest point
};

// Main ASL recognition function - optimized with early returns
export const recognizeASLLetter = (landmarks: NormalizedLandmarkList): { letter: string; confidence: number } => {
  if (!landmarks || landmarks.length < 21) {
    return { letter: "", confidence: 0 };
  }

  const fingers = getFingerState(landmarks);
  const extendedCount = Object.values(fingers).filter(Boolean).length;
  
  // Get key measurements for complex signs
  const thumbIndexDist = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
  const thumbMiddleDist = distance(landmarks[THUMB_TIP], landmarks[MIDDLE_TIP]);
  const indexMiddleDist = distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]);
  const palmSize = distance(landmarks[WRIST], landmarks[MIDDLE_MCP]);
  
  // Normalized distances
  const thumbIndexNorm = thumbIndexDist / palmSize;
  const thumbMiddleNorm = thumbMiddleDist / palmSize;
  
  // Check if hand is pointing sideways (for G, H, P, Q)
  const isPointingSideways = Math.abs(landmarks[INDEX_TIP].x - landmarks[WRIST].x) > 
    Math.abs(landmarks[INDEX_TIP].y - landmarks[WRIST].y);
  
  // Check if pointing down (for P, Q)
  const isPointingDown = landmarks[INDEX_TIP].y > landmarks[INDEX_MCP].y;
  
  // === RECOGNITION LOGIC ===
  
  // 5 / Open Palm - All fingers extended
  if (extendedCount === 5) {
    return { letter: "5", confidence: 0.92 };
  }
  
  // A - Fist with thumb beside (not wrapped)
  if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    if (fingers.thumb && landmarks[THUMB_TIP].x < landmarks[INDEX_MCP].x) {
      return { letter: "A", confidence: 0.88 };
    }
    // S - Fist with thumb over fingers
    if (!fingers.thumb || landmarks[THUMB_TIP].y < landmarks[INDEX_PIP].y) {
      return { letter: "S", confidence: 0.82 };
    }
    // E - All curled, thumb across
    if (areTouching(landmarks, THUMB_TIP, INDEX_PIP, 0.08)) {
      return { letter: "E", confidence: 0.80 };
    }
  }
  
  // B - Flat hand, fingers up, thumb tucked
  if (fingers.index && fingers.middle && fingers.ring && fingers.pinky && !fingers.thumb) {
    return { letter: "B", confidence: 0.88 };
  }
  
  // C - Curved hand shape
  if (extendedCount >= 3) {
    const curveCheck = distance(landmarks[THUMB_TIP], landmarks[PINKY_TIP]);
    if (curveCheck / palmSize < 0.8 && curveCheck / palmSize > 0.3) {
      return { letter: "C", confidence: 0.78 };
    }
  }
  
  // D - Index up, others touch thumb
  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    if (areTouching(landmarks, THUMB_TIP, MIDDLE_TIP, 0.07)) {
      return { letter: "D", confidence: 0.85 };
    }
  }
  
  // F - Index and thumb touching, others extended
  if (!fingers.index && fingers.middle && fingers.ring && fingers.pinky) {
    if (areTouching(landmarks, THUMB_TIP, INDEX_TIP, 0.06)) {
      return { letter: "F", confidence: 0.85 };
    }
  }
  
  // G - Index and thumb pointing sideways
  if (isPointingSideways && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    if (fingers.thumb && !isPointingDown) {
      return { letter: "G", confidence: 0.80 };
    }
  }
  
  // H - Index and middle pointing sideways
  if (isPointingSideways && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    if (!isPointingDown) {
      return { letter: "H", confidence: 0.82 };
    }
  }
  
  // I - Pinky up only
  if (!fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    if (!fingers.thumb) {
      return { letter: "I", confidence: 0.88 };
    }
  }
  
  // K - Index and middle up, thumb between (like V but with thumb up)
  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && fingers.thumb) {
    const thumbBetween = landmarks[THUMB_TIP].y < landmarks[INDEX_TIP].y &&
      landmarks[THUMB_TIP].x > landmarks[INDEX_TIP].x - 0.05 &&
      landmarks[THUMB_TIP].x < landmarks[MIDDLE_TIP].x + 0.05;
    if (thumbBetween && !isPointingDown) {
      return { letter: "K", confidence: 0.78 };
    }
  }
  
  // L - L shape with thumb and index
  if (fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    if (!isPointingSideways) {
      return { letter: "L", confidence: 0.88 };
    }
  }
  
  // M - Thumb under three fingers
  if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb) {
    const thumbUnder3 = landmarks[THUMB_TIP].y > landmarks[INDEX_PIP].y &&
      areTouching(landmarks, THUMB_TIP, RING_MCP, 0.1);
    if (thumbUnder3) {
      return { letter: "M", confidence: 0.72 };
    }
  }
  
  // N - Thumb under two fingers
  if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb) {
    const thumbUnder2 = landmarks[THUMB_TIP].y > landmarks[INDEX_PIP].y &&
      areTouching(landmarks, THUMB_TIP, MIDDLE_MCP, 0.1);
    if (thumbUnder2 && !areTouching(landmarks, THUMB_TIP, RING_MCP, 0.08)) {
      return { letter: "N", confidence: 0.70 };
    }
  }
  
  // O - All fingers curved to meet thumb
  if (thumbIndexNorm < 0.4 && thumbMiddleNorm < 0.5) {
    if (areTouching(landmarks, THUMB_TIP, INDEX_TIP, 0.08) || 
        areTouching(landmarks, THUMB_TIP, MIDDLE_TIP, 0.08)) {
      return { letter: "O", confidence: 0.80 };
    }
  }
  
  // P - Like K pointing down
  if (isPointingDown && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    return { letter: "P", confidence: 0.75 };
  }
  
  // Q - Like G pointing down
  if (isPointingDown && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    if (fingers.thumb) {
      return { letter: "Q", confidence: 0.75 };
    }
  }
  
  // R - Cross index over middle
  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    const indexCrossMid = Math.abs(landmarks[INDEX_TIP].x - landmarks[MIDDLE_TIP].x) < 0.03;
    if (indexCrossMid) {
      return { letter: "R", confidence: 0.78 };
    }
  }
  
  // T - Thumb between index and middle in fist
  if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    const thumbBetween = landmarks[THUMB_TIP].x > landmarks[INDEX_MCP].x - 0.02 &&
      landmarks[THUMB_TIP].x < landmarks[MIDDLE_MCP].x + 0.02 &&
      landmarks[THUMB_TIP].y > landmarks[INDEX_PIP].y;
    if (thumbBetween) {
      return { letter: "T", confidence: 0.72 };
    }
  }
  
  // U - Index and middle together pointing up
  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb) {
    const fingersTogether = indexMiddleDist / palmSize < 0.25;
    if (fingersTogether && !isPointingSideways) {
      return { letter: "U", confidence: 0.85 };
    }
  }
  
  // V - Peace sign (index and middle spread)
  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    const fingersSpread = indexMiddleDist / palmSize > 0.25;
    if (fingersSpread && !isPointingSideways && !isPointingDown) {
      return { letter: "V", confidence: 0.88 };
    }
  }
  
  // W - Three fingers up spread
  if (fingers.index && fingers.middle && fingers.ring && !fingers.pinky) {
    if (!fingers.thumb) {
      return { letter: "W", confidence: 0.85 };
    }
  }
  
  // X - Index finger hooked
  if (!fingers.middle && !fingers.ring && !fingers.pinky) {
    if (isFingerHooked(landmarks, INDEX_TIP, INDEX_DIP, INDEX_PIP)) {
      return { letter: "X", confidence: 0.80 };
    }
  }
  
  // Y - Thumb and pinky out
  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return { letter: "Y", confidence: 0.90 };
  }
  
  return { letter: "", confidence: 0 };
};

// Stabilization buffer for smoother detection
export class DetectionStabilizer {
  private buffer: string[] = [];
  private readonly bufferSize: number;
  private readonly threshold: number;
  
  constructor(bufferSize = 4, threshold = 3) {
    this.bufferSize = bufferSize;
    this.threshold = threshold;
  }
  
  addDetection(letter: string): string | null {
    this.buffer.push(letter);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    
    // Count occurrences
    const counts: Record<string, number> = {};
    for (const l of this.buffer) {
      if (l) counts[l] = (counts[l] || 0) + 1;
    }
    
    // Return letter if it appears enough times
    for (const [letter, count] of Object.entries(counts)) {
      if (count >= this.threshold) {
        return letter;
      }
    }
    
    return null;
  }
  
  reset(): void {
    this.buffer = [];
  }
}
