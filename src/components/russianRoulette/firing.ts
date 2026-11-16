/** Muzzle-spin action: the cylinder turns 60° per chamber over this long. */
export const RR_SPIN_MS = 900;
export const RR_FIRE_LEAD_MS = 500;
export const RR_FIRE_ROTATE_MS = 900;
export const RR_FIRE_STEP_MS = 1550;
export const RR_FIRE_FLASH_MS = 280;
export const RR_FIRE_TAIL_MS = 650;

export const russianRouletteFiringDuration = (shots: number) =>
  shots === 0 ? 0 : RR_FIRE_LEAD_MS + (shots - 1) * RR_FIRE_STEP_MS + RR_FIRE_ROTATE_MS + RR_FIRE_TAIL_MS;
