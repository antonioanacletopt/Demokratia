// Redirect handled by middleware to avoid CDN-cached 308.
// This page should never be reached in normal operation.
export default function RootPage() {
  return null;
}

