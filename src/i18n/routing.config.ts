import { LANGUAGES, type Lang } from './config.i18n';

export interface RoutingConfig {
  /**
   * When useSource is true, URLs without a language prefix (e.g. /grocery, /about-us, /)
   * are rendered in the defaultLocale directly at root, without changing or redirecting the URL.
   * When useSource is false, standard prefix routing applies.
   */
  useSource: boolean;
  defaultLocale: Lang;
}

export const routingConfig: RoutingConfig = {
  useSource: true,
  defaultLocale: 'es',
};
