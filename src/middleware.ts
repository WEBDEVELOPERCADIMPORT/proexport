import { defineMiddleware } from 'astro:middleware';
import { LANGUAGES } from './i18n/config.i18n';
import { routingConfig } from './i18n/routing.config';

const locales = Object.keys(LANGUAGES);

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;
    const { defaultLocale, useSource } = routingConfig;

    // 1. Ignorar archivos estáticos, assets de Astro, robots.txt o endpoints internos
    if (
        pathname.startsWith('/_') ||
        pathname === '/robots.txt' ||
        pathname.includes('.')
    ) {
        return next();
    }

    // Si useSource es false, dejamos que Astro maneje los prefijos (/en/... y /es/...)
    if (!useSource) {
        return next();
    }

    // CLAVE PARA EVITAR EL BUCLE:
    // Si ya reescribimos esta petición internamente, dejamos que Astro renderice la página
    if ((context.locals as any).isRewritten) {
        return next();
    }

    // 2. Si useSource está activo y el usuario entró con /en o /en/..., redirigir a la ruta limpia (302 temporal)
    const originalUrl = new URL(context.request.url);
    const originalPathname = originalUrl.pathname;
    if (
        originalPathname === `/${defaultLocale}` ||
        originalPathname.startsWith(`/${defaultLocale}/`)
    ) {
        const cleanPath = (originalPathname.replace(`/${defaultLocale}`, '') || '/') + originalUrl.search;
        return context.redirect(cleanPath, 302);
    }

    // 3. Si la URL ya tiene otro idioma válido (/es o /es/...) -> Dejar pasar
    const hasOtherLocale = locales.some(
        (locale) =>
            locale !== defaultLocale &&
            (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
    );

    if (hasOtherLocale) {
        return next();
    }

    // 4. Si NO tiene idioma (ej. /grocery) -> Marcamos y hacemos rewrite a /en/grocery
    (context.locals as any).isRewritten = true;
    const targetPath = (pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`) + context.url.search;
    return context.rewrite(targetPath);
});