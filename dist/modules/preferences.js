export const SEARCH_STORAGE_KEY = 'maritime-search-v1';
export const searchFields = {
  start: 'searchStart', end: 'searchEnd', step: 'searchStep', leg: 'searchLeg',
  minElevation: 'minElevation', maxElevation: 'maxElevation', fov: 'searchFov',
  reference: 'searchReference', maxAngle: 'searchAngle', minimum: 'searchMinimum'
};

export function resolveSearchPreferences(project, saved) {
  const day = project.departure.slice(0, 10);
  const settings = {
    start: day + 'T07:00', end: day + 'T10:00', step: 5, leg: 'all',
    minElevation: 5, maxElevation: 20, fov: 'inside', reference: 'none',
    maxAngle: 45, minimum: 1
  };
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return settings;
  for (const key of ['start', 'end']) {
    if (typeof saved[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(saved[key]) && Number.isFinite(Date.parse(saved[key] + '+08:00'))) settings[key] = saved[key];
  }
  const ranges = { step: [1, 120], minElevation: [0, 90], maxElevation: [0, 90], maxAngle: [0, 180], minimum: [0, Infinity] };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (Number.isFinite(saved[key]) && saved[key] >= min && saved[key] <= max) settings[key] = saved[key];
  }
  if (['inside', 'outside', 'any'].includes(saved.fov)) settings.fov = saved.fov;
  if (['none', 'ship', 'camera'].includes(saved.reference)) settings.reference = saved.reference;
  if (typeof saved.leg === 'string' && /^(0|[1-9]\d*)$/.test(saved.leg) && Number(saved.leg) < project.segments.length) settings.leg = saved.leg;
  return settings;
}
