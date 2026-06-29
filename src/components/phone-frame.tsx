import { type ReactNode } from 'react';

/**
 * Native (iOS/Android) passthrough: the app already runs full-screen on a real
 * device, so there is no frame to draw. The web implementation lives in
 * phone-frame.web.tsx.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
