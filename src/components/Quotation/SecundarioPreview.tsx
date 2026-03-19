import { useEffect, useRef } from "react";
import globalCss from "./globalsecundario.css?raw";
import styleCss from "./stylesecundario.css?raw";

interface QuotationData {
  quotationNo: string;
  date: string;
  notes: string;
  conditions: string;
}

export function SecundarioPreview({ data }: { data: QuotationData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Generate the HTML for the iframe dynamically on every data change
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="utf-8" />
    <base href="${window.location.origin}/src/components/Quotation/" />
    <style>
      ${globalCss}
      ${styleCss}
      body {
        transform: scale(0.65);
        transform-origin: top center;
        overflow-x: hidden;
      }
      .quotation {
        margin: 0 auto;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      .notes-text, .conditions-text {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="quotation">
      <header class="header">
        <div class="container">
          <img class="img" src="img/image.svg" onerror="this.style.display='none'" />
          <div class="div">
            <img class="container-2" src="img/container.svg" onerror="this.style.display='none'" />
            <div class="vertical-divider"></div>
            <div class="container-3">
              <div class="container-4">
                <div class="div-wrapper"><div class="text-wrapper">QUOTATION</div></div>
                <div class="div-wrapper"><div class="text-wrapper-2">${data.quotationNo}</div></div>
              </div>
              <div class="container-5">
                <div class="div-wrapper"><div class="text-wrapper-3">DATE</div></div>
                <div class="div-wrapper"><div class="text-wrapper-4">${data.date}</div></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="main">
        <div class="notes">
          <div class="left-side-notes">
            <div class="container-6">
              <div class="div-2"><img class="icon" src="img/icon-2.svg" onerror="this.style.display='none'" /></div>
              <div class="div-2"><div class="notes-2">NOTES</div></div>
            </div>
            <div class="container-7">
              <p class="p notes-text">${data.notes}</p>
            </div>
          </div>
          <div class="left-side-notes-2">
            <div class="container-6">
              <div class="div-2"><img class="icon" src="img/icon.svg" onerror="this.style.display='none'" /></div>
              <div class="heading">
                <p class="cotizaci-n-sujeta-a">COTIZACIÓN SUJETA A LAS SIGUIENTES CONDICIONES</p>
              </div>
            </div>
            <div class="container-7">
              <p class="element-sujeta-a-piezas conditions-text">${data.conditions}</p>
            </div>
          </div>
        </div>
      </div>
      <footer class="footer">
        <div class="container-wrapper">
          <div class="container-8">
            <div class="ocean-operations-wrapper"><div class="ocean-operations">OCEAN OPERATIONS</div></div>
            <div class="container-9">
              <p class="text-wrapper-5">Av Ventisquero 1111, Bodega 58, Renca, Santiago, RM 7550000. CHILE</p>
            </div>
          </div>
        </div>
        <div class="container-10">
          <div class="background">
            <div class="div-2"><div class="icon-2"></div></div>
          </div>
          <div class="container-11"><div class="text-wrapper-6">www.sclcargo.cl</div></div>
        </div>
      </footer>
    </div>
  </body>
</html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col pt-8">
      <iframe 
        ref={iframeRef} 
        title="Quotation Preview Secundario" 
        className="w-full h-[85vh] border-0 drop-shadow-xl bg-transparent rounded-lg"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
