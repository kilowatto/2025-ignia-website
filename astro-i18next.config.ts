// astro-i18next.config.ts

interface AstroI18nextConfig {
  defaultLocale: string;
  locales: string[];
  i18nextInit?: {
    lng?: string;
    fallbackLng?: string;
    defaultNS?: string;
    debug?: boolean;
    backend?: {
      loadPath?: string;
    };
  };
}

const config: AstroI18nextConfig = {
  defaultLocale: "en",
  locales: ["en", "es", "fr"],
  i18nextInit: {
    // La configuración de inicialización
    lng: "en",
    fallbackLng: "en",

    // ¡ESTA ES LA LÍNEA CLAVE!
    // Le decimos que nuestro archivo por defecto se llama "common"
    defaultNS: "common",

    // ¡Y ESTA ES NUESTRA HERRAMIENTA DE DEPURACIÓN!
    // Activamos los logs en la consola del navegador
    debug: true,
    backend: {
      // Esta ruta es relativa a la raíz del proyecto
      loadPath: "./public/locales/{{lng}}/{{ns}}.json",
    },
  },
};

export default config;