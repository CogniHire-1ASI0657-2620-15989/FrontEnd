// Relativas a VITE_API_URL, que debe terminar en /api/v1.
const segment = value => encodeURIComponent(value)

export const gatewayRoutes = {
  search: import.meta.env.VITE_JOB_SEARCH_PATH || '/jobs',
  detail: id => (import.meta.env.VITE_JOB_DETAIL_PATH || '/jobs/:id')
    .replace(':id', segment(id)),
  favorite: id => `/jobs/${segment(id)}/favorite`,
  favorites: '/favorites',
  gapAnalysis: import.meta.env.VITE_GAP_ANALYSIS_PATH || '/gap-reports',
  gapReport: id => `${import.meta.env.VITE_GAP_ANALYSIS_PATH || '/gap-reports'}/${segment(id)}`,

  learningPaths: '/learning-paths',
  learningPathByJob: jobId => `/learning-paths/${segment(jobId)}`,
  learningItem: (pathId, itemId) => `/learning-paths/${segment(pathId)}/items/${segment(itemId)}`,
  learningProgress: pathId => `/learning-paths/${segment(pathId)}/progress`,

  certificates: '/certificates',
  certificate: id => `/certificates/${segment(id)}`,
  certificateSync: id => `/certificates/${segment(id)}/synchronization`,

  interviews: '/interview-sessions',
  interview: id => `/interview-sessions/${segment(id)}`,
  interviewMessages: id => `/interview-sessions/${segment(id)}/messages`,
  interviewComplete: id => `/interview-sessions/${segment(id)}/complete`
}
