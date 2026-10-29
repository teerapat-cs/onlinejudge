import { Platform } from 'react-native';

/**
 * Base URL of the Loco backend.
 *
 * `EXPO_PUBLIC_API_URL` is inlined into the bundle at build time (see
 * `Dockerfile` and `../DEPLOY_RAILWAY.md`), so it must be provided to
 * `expo export` / `expo start`, not at runtime.
 *
 * Without it we fall back to the local dev server:
 * - Android emulator reaches the host loopback through 10.0.2.2
 * - iOS simulator, web and Expo Go on the same LAN use localhost
 */
const DEFAULT_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5150' : 'http://localhost:5150';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, '');
