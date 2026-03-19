import { AppHeader } from "@/components/layout/AppHeader";

import indexPrincipalHtml from "@/components/Quotation/indexprincipal.html?raw";
import globalPrincipalCss from "@/components/Quotation/globalprincipal.css?raw";
import stylePrincipalCss from "@/components/Quotation/styleprincipal.css?raw";

import indexSecundarioHtml from "@/components/Quotation/indexsecundario.html?raw";
import globalSecundarioCss from "@/components/Quotation/globalsecundario.css?raw";
import styleSecundarioCss from "@/components/Quotation/stylesecundario.css?raw";

function generateIframeContent(html: string, globalCss: string, styleCss: string) {
  const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
  const baseTag = `<base href="${window.location.origin}/src/components/Quotation/" />`;
  
  return html.replace("</head>", `${baseTag}\n${styleTag}\n</head>`);
}

export function Cotizacion() {
  const principalSrc = generateIframeContent(indexPrincipalHtml, globalPrincipalCss, stylePrincipalCss);
  const secundarioSrc = generateIframeContent(indexSecundarioHtml, globalSecundarioCss, styleSecundarioCss);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader />
      
      <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12">
        <div className="w-full max-w-[1000px] h-[1529px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] shrink-0">
          <iframe 
            srcDoc={principalSrc}
            className="w-full h-full border-0"
            title="Página Principal"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        <div className="w-full max-w-[1000px] h-[1529px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] shrink-0">
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
