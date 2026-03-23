import { useEffect, useRef } from "react";
import globalCss from "./globalprincipal.css?raw";
import styleCss from "./styleprincipal.css?raw";
import jsBarcodeScript from "jsbarcode/dist/JsBarcode.all.min.js?raw";

interface QuotationData {
  quotationNo: string;
  date: string;
  requestedByCompany: string;
  requestedByRepresentative: string;
  requestedByPhone: string;
  requestedByEmail: string;
  requestedByAddress: string;
  createdBy: string;
  expiresOn: string;
  transportMode: string;
  serviceType: string;
  carrier: string;
  frequency: string;
  paymentTerms: string;
  incoterms: string;
  originPort: string;
  originPlace: string;
  originCompany: string;
  originAddress: string;
  destPort: string;
  destPlace: string;
  destCompany: string;
  destAddress: string;
  goodsDescription: string;
}

interface PrincipalPreviewProps {
  data: QuotationData;
  onHeaderChange: (headerHtml: string) => void;
}

export function PrincipalPreview({ data, onHeaderChange }: PrincipalPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'HEADER_UPDATED') {
        onHeaderChange(event.data.headerHtml);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onHeaderChange]);

  useEffect(() => {
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="utf-8" />
    <base href="${window.location.origin}/src/components/Quotation/" />
    <script>
      ${jsBarcodeScript}
    </script>
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
        margin-bottom: 20px;
      }
      .general-air-cargo {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="quotation">
      <header class="header" id="main-header">
        <div class="container">
          <img class="img" src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png" />
          <div class="div">
            <img class="container-2 barcode-container" />
            <div class="vertical-divider"></div>
            <div class="container-3">
              <div class="container-4">
                <div class="div-wrapper">
                  <div class="text-wrapper editable" contenteditable="true">QUOTATION</div>
                </div>
                <div class="div-wrapper">
                  <div class="text-wrapper-2 editable quotation-number" contenteditable="true">${data.quotationNo}</div>
                </div>
              </div>
              <div class="container-5">
                <div class="div-wrapper">
                  <div class="text-wrapper-3 editable" contenteditable="true">DATE</div>
                </div>
                <div class="div-wrapper">
                  <div class="text-wrapper-4 editable" contenteditable="true">${data.date}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="main">
        <div class="container-6">
          <div class="top-row-requested-by">
            <div class="requested-by-section">
              <div class="horizontal-border">
                <img class="img" src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/container.svg" />
                <div class="heading"><div class="requested-by">REQUESTED BY</div></div>
              </div>
              <div class="background-border">
                <div class="container-7">
                  <div class="div-2"><div class="text-wrapper-5">NAME / COMPANY</div></div>
                  <div class="div-2">
                    <div class="HANKA-OPERADOR">${data.requestedByCompany}</div>
                  </div>
                </div>
                <div class="container-8">
                  <div class="div-2"><div class="text-wrapper-5">REPRESENTATIVE</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.requestedByRepresentative}</div></div>
                </div>
                <div class="container-9">
                  <div class="div-2"><div class="text-wrapper-5">PHONE</div></div>
                  <div class="div-2"><p class="text-wrapper-6">${data.requestedByPhone}</p></div>
                </div>
                <div class="container-10">
                  <div class="div-2"><div class="text-wrapper-5">EMAIL</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.requestedByEmail}</div></div>
                </div>
                <div class="container-11">
                  <div class="div-2"><div class="text-wrapper-5">ADDRESS</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.requestedByAddress}</div></div>
                </div>
              </div>
            </div>
            <div class="quote-details">
              <div class="horizontal-border-2">
                <div class="icon-wrapper"><div class="icon"></div></div>
                <div class="quote-details-wrapper"><div class="quote-details-2">QUOTE DETAILS</div></div>
                <div class="container-12">
                  <div class="container-13"><div class="created-by">CREATED BY</div></div>
                  <div class="container-13"><div class="text-wrapper-7">${data.createdBy}</div></div>
                </div>
              </div>
              <div class="container-wrapper">
                <div class="container-14">
                  <div class="container-15">
                    <div class="div-2"><div class="text-wrapper-5">QUOTE EXPIRES</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.expiresOn}</div></div>
                  </div>
                  <div class="container-16">
                    <div class="div-2"><div class="text-wrapper-5">MODE OF TRANSPORTATION</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.transportMode}</div></div>
                  </div>
                  <div class="container-17">
                    <div class="div-2"><div class="text-wrapper-5">SERVICE TYPE</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.serviceType}</div></div>
                  </div>
                  <div class="container-18">
                    <div class="div-2"><div class="text-wrapper-5">CARRIER</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.carrier}</div></div>
                  </div>
                  <div class="container-19">
                    <div class="div-2"><div class="text-wrapper-5">FREQUENCY</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.frequency}</div></div>
                  </div>
                  <div class="container-20">
                    <div class="div-2"><div class="text-wrapper-5">PAYMENT TERMS</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.paymentTerms}</div></div>
                  </div>
                  <div class="container-21">
                    <div class="div-2"><div class="text-wrapper-5">INCOTERMS</div></div>
                    <div class="div-2"><div class="text-wrapper-6">${data.incoterms}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom-row-origin">
            <div class="section">
              <div class="horizontal-border">
                <div class="container-22"><img class="icon-2" src="img/icon.svg" onerror="this.style.display='none'" /></div>
                <div class="heading"><div class="origin">ORIGIN</div></div>
              </div>
              <div class="background-border-2">
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">PORT OF LOADING</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.originPort || '-'}</div></div>
                </div>
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">PLACE OF RECEIPT</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.originPlace || '-'}</div></div>
                </div>
                <div class="container-23">
                  <div class="div-2"><div class="text-wrapper-5">NAME/COMPANY</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.originCompany || '-'}</div></div>
                </div>
                <div class="container-24">
                  <div class="div-2"><div class="text-wrapper-5">ADDRESS</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.originAddress || '-'}</div></div>
                </div>
              </div>
            </div>
            <div class="section-2">
              <div class="horizontal-border">
                <div class="container-25"><div class="icon-3"></div></div>
                <div class="heading"><div class="destination">DESTINATION</div></div>
              </div>
              <div class="background-border-3">
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">PORT OF UNLOADING</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.destPort || '-'}</div></div>
                </div>
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">PLACE OF DELIVERY</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.destPlace || '-'}</div></div>
                </div>
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">NAME/COMPANY</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.destCompany || '-'}</div></div>
                </div>
                <div class="div-2">
                  <div class="div-2"><div class="text-wrapper-5">ADDRESS</div></div>
                  <div class="div-2"><div class="text-wrapper-6">${data.destAddress || '-'}</div></div>
                </div>
              </div>
            </div>
            <div class="new-section">
              <div class="horizontal-border">
                <div class="container-22"><div class="icon-4"></div></div>
                <div class="heading"><div class="description-of-goods">DESCRIPTION OF GOODS</div></div>
              </div>
              <div class="background-border-4">
                <div class="general-air-cargo-wrapper">
                  <p class="general-air-cargo">${data.goodsDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="board">
          <div class="border">
            <div class="div-2">
              <div class="header-row">
                <div class="cell"><div class="text-wrapper-8">CHARGE</div></div>
                <div class="quantity-wrapper"><div class="quantity">QUANTITY</div></div>
                <div class="unit-wrapper"><div class="unit">UNIT</div></div>
                <div class="price-wrapper"><div class="price">PRICE</div></div>
                <div class="amount-wrapper"><div class="amount">AMOUNT</div></div>
              </div>
              
              <div class="row">
                <div class="data">
                  <div class="container-26"><p class="text-wrapper-9 editable" contenteditable="true">Ocean Freight - CNT:40 Ft. Hight Cube</p></div>
                </div>
                <div class="data-2"><div class="text-wrapper-10 editable" contenteditable="true">163.41</div></div>
                <div class="data-3"><div class="text-wrapper-11 editable" contenteditable="true">VKg</div></div>
                <div class="data-4"><div class="text-wrapper-12 editable" contenteditable="true">3.75</div></div>
                <div class="data-5"><div class="text-wrapper-13 editable" contenteditable="true">$549.673 CLP</div></div>
                <div class="delete-action"><img src="https://storage.googleapis.com/sclcargo/web/Home/grupo-49257.png" class="delete-icon" /></div>
              </div>
              <div class="row-2">
                <div class="data-6">
                  <div class="container-27"><div class="text-wrapper-9 editable" contenteditable="true">Fuel Service</div></div>
                </div>
                <div class="data-7"><div class="text-wrapper-14 editable" contenteditable="true">163.41</div></div>
                <div class="data-8"><div class="text-wrapper-15 editable" contenteditable="true">VKg</div></div>
                <div class="data-9"><div class="text-wrapper-16 editable" contenteditable="true">0.30</div></div>
                <div class="data-10"><div class="text-wrapper-17 editable" contenteditable="true">$49.02 USD</div></div>
                <div class="delete-action"><img src="https://storage.googleapis.com/sclcargo/web/Home/grupo-49257.png" class="delete-icon" /></div>
              </div>
              
              <div class="add-row-container">
                <button class="add-button" type="button">AGREGAR</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="total">
        <div class="right-side-totals">
          <div class="container-30">
            <div class="container-31">
              <div class="container-32"><div class="text">SUBTOTAL</div></div>
              <div class="container-32"><div class="text-wrapper-40">$0.00 CLP</div></div>
            </div>
            <div class="container-31">
              <div class="container-32"><div class="tax">TAX</div></div>
              <div class="container-32"><div class="text-2 editable tax-input" contenteditable="true">$0.00</div></div>
            </div>
            <div class="background">
              <div class="margin"><div class="text-wrapper-41">TOTAL (CLP)</div></div>
              <div class="container-25"><div class="text-wrapper-42">$0.00</div></div>
            </div>
          </div>
          <div class="container-30">
            <div class="container-31">
              <div class="container-32"><div class="text">SUBTOTAL</div></div>
              <div class="container-32"><div class="text-wrapper-43">$0.00 USD</div></div>
            </div>
            <div class="container-31">
              <div class="container-32"><div class="tax">TAX</div></div>
              <div class="container-32"><div class="text-2 editable tax-input" contenteditable="true">$0.00</div></div>
            </div>
            <div class="background">
              <div class="margin"><div class="text-wrapper-41">TOTAL (USD)</div></div>
              <div class="container-25"><div class="text-wrapper-44">$0.00</div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="signature-line">
        <div class="signature-name-wrapper">
          <div class="signature-name editable" contenteditable="true"></div>
        </div>
        <div class="horizontal-divider-wrapper">
          <div class="horizontal-divider"></div>
        </div>
        <div class="signature-wrapper">
          <div class="signature">SIGNATURE</div>
        </div>
      </div>
      <footer class="footer">
        <div class="container-33">
          <div class="container-32">
            <div class="div-2"><div class="ocean-operations">OCEAN OPERATIONS</div></div>
            <div class="container-34">
              <p class="p">Av Ventisquero 1111, Bodega 58, Renca, Santiago, RM 7550000. CHILE</p>
            </div>
          </div>
        </div>
        <div class="container-35">
          <div class="background-2">
            <div class="container-25"><div class="icon-5"></div></div>
          </div>
          <div class="container-36"><div class="text-wrapper-45">www.sclcargo.cl</div></div>
        </div>
      </footer>
    </div>
    
    <script>
      function actualizarCodigoBarras() {
        if (typeof window.JsBarcode !== 'function') return;
        const numElement = document.querySelector('.quotation-number');
        let valor = numElement ? numElement.innerText.trim() : 'QT-0000';
        if (valor === '') valor = 'QT-0000';

        const barcodes = document.querySelectorAll('.barcode-container');
        barcodes.forEach(img => {
          try {
            window.JsBarcode(img, valor, {
              format: "CODE128",     
              displayValue: false,   
              lineColor: "#2f2f2f",  
              background: "transparent",
              width: 2,              
              height: 48,            
              margin: 0
            });
          } catch (e) {}
        });
      }

      function calcularTotales() {
        let subtotalCLP = 0;
        let subtotalUSD = 0;

        const todasLasFilas = document.querySelectorAll('.row, .row-2, .row-3, .row-4');

        todasLasFilas.forEach(row => {
          const amountElement = row.querySelector('.data-5 .text-wrapper-13, .data-10 .text-wrapper-17, .data-12 .text-wrapper-20, .data-12 .text-wrapper-24, .data-12 .text-wrapper-28, .data-12 .text-wrapper-31, .data-12 .text-wrapper-35, .data-12 .text-wrapper-36, .data-12 .text-wrapper-38');

          if (amountElement) {
            const textoMoneda = amountElement.innerText.trim().toUpperCase();
            const numeroLimpio = textoMoneda.replace(/[^0-9.,-]/g, '').replace(/\\./g, '');
            const valor = parseFloat(numeroLimpio.replace(',', '.')) || 0;

            if (textoMoneda.includes('CLP') || textoMoneda.includes('CL')) {
              subtotalCLP += valor;
            } else if (textoMoneda.includes('USD')) {
              subtotalUSD += valor;
            }
          }
        });

        const taxInputs = document.querySelectorAll('.tax-input');
        let taxCLP = 0;
        let taxUSD = 0;

        if (taxInputs.length >= 2) {
          const textoTaxCLP = taxInputs[0].innerText.trim();
          const textoTaxUSD = taxInputs[1].innerText.trim();

          taxCLP = parseFloat(textoTaxCLP.replace(/[^0-9.,-]/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
          taxUSD = parseFloat(textoTaxUSD.replace(/[^0-9.,-]/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
        }

        const totalFinalCLP = subtotalCLP + taxCLP;
        const totalFinalUSD = subtotalUSD + taxUSD;

        const formatterCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
        const formatterUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        const subtotalDOM_CLP = document.querySelector('.text-wrapper-40');
        const subtotalDOM_USD = document.querySelector('.text-wrapper-43');
        if (subtotalDOM_CLP) subtotalDOM_CLP.innerText = formatterCLP.format(subtotalCLP) + ' CLP';
        if (subtotalDOM_USD) subtotalDOM_USD.innerText = formatterUSD.format(subtotalUSD) + ' USD';

        const totalDOM_CLP = document.querySelector('.text-wrapper-42');
        const totalDOM_USD = document.querySelector('.text-wrapper-44');
        if (totalDOM_CLP) totalDOM_CLP.innerText = formatterCLP.format(totalFinalCLP);
        if (totalDOM_USD) totalDOM_USD.innerText = formatterUSD.format(totalFinalUSD);
      }

      document.addEventListener('click', function(e) {
        const getRowContainer = (quotationNode) => {
          return quotationNode.querySelector('.border > .div-2');
        };

        const deleteBtn = e.target.closest('.delete-action');
        if (deleteBtn) {
          const row = deleteBtn.closest('.row, .row-2, .row-3, .row-4');
          const quotation = deleteBtn.closest('.quotation');
          
          if (row && quotation) {
            row.remove();
            calcularTotales(); 
            
            const rowContainer = getRowContainer(quotation);
            const remainingRows = rowContainer ? rowContainer.querySelectorAll('.row, .row-2, .row-3, .row-4') : [];
            
            if (remainingRows.length === 0) {
              const allQuotations = Array.from(document.querySelectorAll('.quotation'));
              const index = allQuotations.indexOf(quotation);
              
              if (index > 0) {
                if (index === allQuotations.length - 1) {
                  const prevQuotation = allQuotations[index - 1];
                  
                  const addBtnContainer = quotation.querySelector('.add-row-container');
                  const totals = quotation.querySelector('.total');
                  const signature = quotation.querySelector('.signature-line');
                  
                  if (addBtnContainer) {
                    const prevRowContainer = getRowContainer(prevQuotation);
                    if (prevRowContainer) prevRowContainer.appendChild(addBtnContainer);
                  }
                  
                  if (totals) {
                    const prevMain = prevQuotation.querySelector('.main') || prevQuotation.querySelector('.board');
                    if (prevMain && prevMain.parentNode) {
                      prevMain.parentNode.insertBefore(totals, prevMain.nextSibling);
                    }
                  }
                  
                  if (signature) {
                    const prevFooter = prevQuotation.querySelector('.footer');
                    if (prevFooter && prevFooter.parentNode) {
                      prevFooter.parentNode.insertBefore(signature, prevFooter);
                    }
                  }
                }
                quotation.remove();
              }
            }
          }
          return;
        }
        
        const addBtn = e.target.closest('.add-button');
        if (addBtn) {
          const allQuotations = Array.from(document.querySelectorAll('.quotation'));
          const lastIndex = allQuotations.length - 1;
          const lastQuotation = allQuotations[lastIndex];
          
          const rowContainer = getRowContainer(lastQuotation);
          if (!rowContainer) return;

          const rows = rowContainer.querySelectorAll('.row, .row-2, .row-3, .row-4');
          if (rows.length === 0) return;
          
          const lastRow = rows[rows.length - 1];
          const newRow = lastRow.cloneNode(true);
          
          const editables = newRow.querySelectorAll('[contenteditable="true"]');
          editables.forEach(el => { el.innerText = ''; });

          const priceCell = newRow.querySelector('.data-5 .text-wrapper-13, .data-10 .text-wrapper-17, .data-12 .text-wrapper-20, .data-12 .text-wrapper-24, .data-12 .text-wrapper-28, .data-12 .text-wrapper-31, .data-12 .text-wrapper-35, .data-12 .text-wrapper-36, .data-12 .text-wrapper-38');
          if (priceCell) priceCell.innerText = '$0 CLP';

          const addRowContainer = rowContainer.querySelector('.add-row-container');
          const currentLimit = (lastIndex === 0) ? 10 : 23;

          if (rows.length < currentLimit) {
            if (addRowContainer) {
              rowContainer.insertBefore(newRow, addRowContainer);
            } else {
              rowContainer.appendChild(newRow);
            }
          } else {
            const newQuotation = lastQuotation.cloneNode(true);
            
            const container6 = newQuotation.querySelector('.container-6');
            if (container6) container6.remove();
            
            const newRowContainer = getRowContainer(newQuotation);
            
            if (newRowContainer) {
               const headerRow = newRowContainer.querySelector('.header-row');
               const clonedAddBtn = newRowContainer.querySelector('.add-row-container');
               newRowContainer.innerHTML = ''; 
               if (headerRow) newRowContainer.appendChild(headerRow);
               newRowContainer.appendChild(newRow);
               if (clonedAddBtn) newRowContainer.appendChild(clonedAddBtn);
            }
            
            const oldAddBtn = lastQuotation.querySelector('.add-row-container');
            const oldTotals = lastQuotation.querySelector('.total');
            const oldSignature = lastQuotation.querySelector('.signature-line');
            
            if (oldAddBtn) oldAddBtn.remove();
            if (oldTotals) oldTotals.remove();
            if (oldSignature) oldSignature.remove();

            lastQuotation.parentNode.appendChild(newQuotation);
          }
          calcularTotales(); 
          actualizarCodigoBarras();
        }
      });

      // =========================================================
      // DETECTAR CAMBIOS EN EL HEADER Y AVISAR A REACT
      // =========================================================
      function notificarCambioHeader() {
        const header = document.getElementById('main-header');
        if (header) {
          window.parent.postMessage({ 
            type: 'HEADER_UPDATED', 
            headerHtml: header.innerHTML 
          }, '*');
        }
      }

      document.addEventListener('input', function (e) {
        if (e.target.closest('[contenteditable="true"]')) {
          calcularTotales();
          
          // Si el elemento editado está dentro del header, notificamos a React
          if (e.target.closest('#main-header')) {
            notificarCambioHeader();
          }
        }
        
        if (e.target.classList.contains('quotation-number')) {
          actualizarCodigoBarras();
        }
      });

      function notificarAlturaAReact() {
        const totalHeight = document.body.scrollHeight;
        window.parent.postMessage({ type: 'RESIZE_PRINCIPAL', height: totalHeight }, '*');
      }

      window.addEventListener('load', () => {
        notificarAlturaAReact();
        calcularTotales();
        actualizarCodigoBarras();
      });

      const observer = new MutationObserver(notificarAlturaAReact);
      observer.observe(document.body, { childList: true, subtree: true });
    </script>
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
        title="Quotation Preview"
        className="w-full h-[85vh] border-0 drop-shadow-xl bg-transparent rounded-lg"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}