import { env } from '$env/dynamic/public';

export function load() {
  return {
    gaId: env.PUBLIC_GA_ID,
  };
}
