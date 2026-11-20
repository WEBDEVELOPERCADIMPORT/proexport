import { LANGUAGES, type Lang } from "./config.i18n";

export function localizedPath(lang: Lang, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${lang}/${clean}` : `/${lang}/`;
}

export function switchLangUrl(currentUrl: URL, targetLang: Lang): string {
  const segments = currentUrl.pathname.split("/").filter(Boolean);
  if (segments.length > 0 && segments[0] in LANGUAGES) {
    segments[0] = targetLang;
  } else {
    segments.unshift(targetLang);
  }

  const trailingSlash = currentUrl.pathname.endsWith("/") ? "/" : "";
  const nextPath = `/${segments.join("/")}${segments.length === 1 ? "/" : trailingSlash}`;
  return `${nextPath}${currentUrl.search}`;
}

export const uiLabels: Record<
  Lang,
  {
    switchToLabel: string;
    switchToTitle: string;
    openMenu: string;
    closeMenu: string;
    sidebarCategoriesTitle: string;
    sidebarBrandsTitle: string;
    sidebarAllProducts: string;
    phoneLabel: string;
  }
> = {
  es: {
    switchToLabel: "English",
    switchToTitle: "Switch to English",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    sidebarCategoriesTitle: "Categorías de producto",
    sidebarBrandsTitle: "Productos por marca",
    sidebarAllProducts: "Todos los productos",
    phoneLabel: "Phone",
  },
  en: {
    switchToLabel: "Español",
    switchToTitle: "Cambiar a Español",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    sidebarCategoriesTitle: "Product categories",
    sidebarBrandsTitle: "Products by Brand",
    sidebarAllProducts: "All products",
    phoneLabel: "Phone",
  },
};

export function getUiLabels(lang: Lang) {
  return uiLabels[lang] ?? uiLabels.es;
}
