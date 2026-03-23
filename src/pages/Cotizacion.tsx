import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

import indexPrincipalHtml from "@/components/Quotation/indexprincipal.html?raw";
import globalPrincipalCss from "@/components/Quotation/globalprincipal.css?raw";
import stylePrincipalCss from "@/components/Quotation/styleprincipal.css?raw";

import indexSecundarioHtml from "@/components/Quotation/indexsecundario.html?raw";
import globalSecundarioCss from "@/components/Quotation/globalsecundario.css?raw";
import styleSecundarioCss from "@/components/Quotation/stylesecundario.css?raw";

function generateIframeContent(html: string, globalCss: string, styleCss: string) {
  // Aquí ocurre la magia visual: Hacemos el fondo transparente y le damos
  // forma de hoja a cada contenedor .quotation individualmente.
  const visualFixes = `
    <style>
      body { 
        background: transparent !important; 
        margin: 0; 
        padding: 0; 
        overflow: hidden; 
      }
      .quotation {
        background-color: white;
        box-shadow: 0 0 40px rgba(0,0,0,0.1);
        margin: 0 auto 48px auto; /* 48px de separación entre hojas */
        height: 1529px; /* Mantenemos la altura exacta que tenías */
        overflow: hidden;
      }
    </style>
  `;

  const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
  const baseTag = `<base href="${window.location.origin}/src/components/Quotation/" />`;

  return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

export function Cotizacion() {
  const principalSrc = generateIframeContent(indexPrincipalHtml, globalPrincipalCss, stylePrincipalCss);
  const secundarioSrc = generateIframeContent(indexSecundarioHtml, globalSecundarioCss, styleSecundarioCss);

  // Estado para la altura dinámica del iframe principal
  const [principalHeight, setPrincipalHeight] = useState(1529);

  // Escuchador para cuando el iframe principal crece (agrega páginas)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RESIZE_PRINCIPAL') {
        setPrincipalHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader />

      <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12">

        {/* CONTENEDOR PRINCIPAL: Ahora es transparente y crece dinámicamente */}
        <div
          className="w-full max-w-[1000px] shrink-0 transition-all duration-300"
          style={{ height: `${principalHeight}px` }}
        >
          <iframe
            srcDoc={principalSrc}
            className="w-full h-full border-0 bg-transparent"
            title="Página Principal"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* CONTENEDOR SECUNDARIO: Este se mantiene estático como lo tenías */}
        <div className="w-full max-w-[1000px] h-[1529px] shrink-0">
          <iframe
            srcDoc={secundarioSrc}
            className="w-full h-full border-0"
            title="Página Secundaria"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </main>
    </div>
  );
}