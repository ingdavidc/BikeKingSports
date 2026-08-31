'use client';
// src/utils/WebUSBPrinter.js
// Utility to print directly to USB POS printers (like SAT 38T USE) using WebUSB API

let usbDevice = null;

// Normaliza texto para quitar tildes y caracteres especiales que rompan la impresión ESC/POS
const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
};

export const autoConnectPrinter = async () => {
  try {
    if (!navigator.usb) return false;
    const devices = await navigator.usb.getDevices();
    if (devices.length > 0) {
      const device = devices[0];
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      const ifaceNumber = device.configuration.interfaces[0].interfaceNumber;
      await device.claimInterface(ifaceNumber);
      usbDevice = device;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error auto-conectando impresora USB:", error);
    return false;
  }
};

export const connectPrinter = async () => {
  try {
    // 7 is printer class code in USB spec
    const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] });
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    
    const ifaceNumber = device.configuration.interfaces[0].interfaceNumber;
    await device.claimInterface(ifaceNumber);
    usbDevice = device;
    return true;
  } catch (error) {
    console.error("Error conectando a la impresora USB:", error);
    return false;
  }
};

export const isPrinterConnected = () => {
  return usbDevice !== null && usbDevice.opened;
};

// Genera los bytes ESC/POS para el recibo
export const printReceipt = async (saleData, cartItems) => {
  if (!isPrinterConnected()) {
    throw new Error("No hay impresora USB conectada.");
  }

  const encoder = new TextEncoder();
  const cmds = [];

  // Helper to push bytes
  const push = (...bytes) => cmds.push(new Uint8Array(bytes));
  const pushStr = (str) => cmds.push(encoder.encode(normalizeText(str)));

  // ESC/POS Commands
  const ESC = 0x1B;
  const GS = 0x1D;

  // Initialize
  push(ESC, 0x40);

  // Align Center
  push(ESC, 0x61, 1);
  
  // Title (Bold, Double size)
  push(ESC, 0x45, 1); // Bold On
  push(GS, 0x21, 0x11); // Double width & height
  pushStr("BIKEKING SPORTS\n");
  
  // Subtitle (Normal size, Bold Off)
  push(GS, 0x21, 0x00);
  push(ESC, 0x45, 0);
  pushStr("Saravena, Arauca\n");
  pushStr("Cel: 310 329 1475\n\n");

  // Align Left
  push(ESC, 0x61, 0);
  pushStr(`Fecha: ${new Date().toLocaleString('es-CO')}\n`);
  pushStr(`Ref: ${saleData.transaction_ref || 'Local'}\n`);
  if (saleData.customer_name) pushStr(`Cliente: ${saleData.customer_name}\n`);
  if (saleData.customer_phone) pushStr(`Tel: ${saleData.customer_phone}\n`);
  pushStr("------------------------------------------\n");
  
  // Items header (Assuming 80mm paper, roughly 42-48 chars per line)
  // Cantidad | Descripcion | Total
  
  cartItems.forEach(item => {
    // 80mm ticket fits ~48 characters on standard font
    let name = item.name.substring(0, 30);
    const qty = String(item.quantity).padEnd(3);
    const total = String(item.price * item.quantity).padStart(12);
    pushStr(`${qty}x ${name}\n`);
    pushStr(`    $${item.price.toLocaleString('es-CO')} c/u -> $${total.trim()}\n`);
  });

  pushStr("------------------------------------------\n");
  
  // Align Right
  push(ESC, 0x61, 2);
  push(ESC, 0x45, 1); // Bold On
  push(GS, 0x21, 0x01); // Double height
  pushStr(`TOTAL: $${saleData.total_amount.toLocaleString('es-CO')}\n`);
  push(GS, 0x21, 0x00);
  push(ESC, 0x45, 0);

  if (saleData.payment_method === 'efectivo' && saleData.cash_received) {
    const received = parseFloat(saleData.cash_received);
    if (received > 0) {
      pushStr(`Recibido: $${received.toLocaleString('es-CO')}\n`);
      const change = received - saleData.total_amount;
      pushStr(`Cambio: $${change.toLocaleString('es-CO')}\n`);
    }
  } else {
    pushStr(`Metodo: ${saleData.payment_method.toUpperCase()}\n`);
  }

  // Align Center
  push(ESC, 0x61, 1);
  pushStr("\n");
  pushStr("!Gracias por tu compra!\n");
  pushStr("Garantia segun especificaciones\n");
  pushStr("\n\n\n\n");

  // Full cut
  push(GS, 0x56, 0x41, 0x00);

  // Send to USB
  // Need to find out point
  let endpointNumber = null;
  const iface = usbDevice.configuration.interfaces[0];
  const alt = iface.alternate;
  for (let i = 0; i < alt.endpoints.length; i++) {
    const ep = alt.endpoints[i];
    if (ep.direction === "out") {
      endpointNumber = ep.endpointNumber;
      break;
    }
  }

  if (endpointNumber === null) {
    throw new Error("No se encontro un punto final (endpoint) de salida en la impresora.");
  }

  // Concatenate all Uint8Arrays
  const totalLength = cmds.reduce((acc, val) => acc + val.length, 0);
  const finalBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (let c of cmds) {
    finalBuffer.set(c, offset);
    offset += c.length;
  }

  await usbDevice.transferOut(endpointNumber, finalBuffer);
};
