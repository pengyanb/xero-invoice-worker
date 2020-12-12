import { CronJob } from "cron";
import axios from "axios";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import persistedData from "./persistedData.json";
import { IServerConfig } from "./serverconfig";

const logoPath = path.resolve(__dirname, "./assets/Logo_RightStrap-1.jpg");

const debug = require("debug")("server:cronjob");
export const CONST_INVOICE_STATUS = ["DRAFT", "SENT", "PAID", "DELETED"];
export const CONST_INVOICE_TYPE = ["INVOICE_CREATED", "INVOICE_UPDATED", "INVOICE_DELETED"];
let cronjob: CronJob | undefined = undefined;
let afterEventId = 0;


enum EnumInvoiceType {
  INVOICE_CREATED = "INVOICE_CREATED", 
  INVOICE_UPDATED ="INVOICE_UPDATED", 
  INVOICE_DELETED = "INVOICE_DELETED"
};

enum EnumInvoiceStatus {
  DRAFT = "DRAFT", 
  SENT = "SENT", 
  PAID = "PAID", 
  DELETED = "DELETED"
}

export interface IInvoiceContentDelete {
  invoiceId: string;
}
export interface IInvoiceContentCreateNUpdate {
  invoiceId: string;
  invoiceNumber: string;
  lineItems: [{
    lineItemId: string;
    description: string;
    quantity: number;
    unitCost: number;
    lineItemTotalCost: number
  }];
  status: string;
  dueDateUtc: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface IInvoiceItem {
  id: number;
  type: string;
  createdDateUtc: string;
  content: IInvoiceContentCreateNUpdate | IInvoiceContentDelete;
}

interface IFetchInvoicesEventsPayload {
  items: IInvoiceItem[],
  eventId: number
}

const fetchInvoicesEvents = async (feedUrl: string, pageSize: number, afterEventId: number) => {
  const url = `${feedUrl}?pageSize=${pageSize}&afterEventId=${afterEventId}`;
  debug("fetch url: ", url);
  return await axios.get(url);
}

const handleCreateFile = async (invoiceItem: IInvoiceItem, filePath: string) => {
  const content = invoiceItem.content as IInvoiceContentCreateNUpdate;
  const pdfDoc = new PDFDocument;
  const writeStream = pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.image(logoPath, undefined, undefined, { width: 240, height: 90});
  pdfDoc.moveDown(2);
  pdfDoc.text(`Invoice Id: ${content.invoiceId}`);
  pdfDoc.moveDown();
  pdfDoc.text(`Invoice Number: ${content.invoiceNumber}`);
  pdfDoc.moveDown();
  pdfDoc.text(`Status: ${content.status}`);
  pdfDoc.moveDown();
  pdfDoc.text(`Due Date: ${content.dueDateUtc}`);
  pdfDoc.moveDown();
  pdfDoc.text(`Create Date: ${content.createdDateUtc}`);
  pdfDoc.moveDown();
  pdfDoc.text(`Update Date: ${content.updatedDateUtc}`);
  pdfDoc.moveDown(2);
  if (content.lineItems.length > 0) {
    content.lineItems.map((lineItem) => {
      pdfDoc.moveDown();
      pdfDoc.text(`Item Id: ${lineItem.lineItemId}`);
      pdfDoc.text(`Description: ${lineItem.description}`);
      pdfDoc.text(`Quantity: ${lineItem.quantity}`);
      pdfDoc.text(`Unit Cost: ${lineItem.unitCost}`);
      pdfDoc.text(`Item Total Cost: ${lineItem.lineItemTotalCost}`);
    });
  }
  pdfDoc.end();
  let resolve: (value: unknown) => void;
  const prom = new Promise((rs) => {
    resolve = rs;
  });
  writeStream.on("close", () => {
    resolve?.("");
  });
  await prom;
}

const handleDeleteFile = async (filePath: string) => {
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath)
  }
}

const handlePdfFiles = async (invoiceDir: string, invoiceItems: IInvoiceItem[]) => {
  await Promise.all(invoiceItems.map(async (invoiceItem) => {
    debug("handlePdfFiles: ", invoiceItem)
    const filePath = `${invoiceDir}\/${invoiceItem.content.invoiceId}.pdf`
    if (invoiceItem.type === EnumInvoiceType.INVOICE_CREATED) {
      await handleCreateFile(invoiceItem, filePath);
    }
    else if (invoiceItem.type === EnumInvoiceType.INVOICE_DELETED) {
      await handleDeleteFile(filePath);
    } else if (invoiceItem.type === EnumInvoiceType.INVOICE_UPDATED) {
      await handleDeleteFile(filePath);
      await handleCreateFile(invoiceItem, filePath);
    }
  }));
};

const createInvoiceDirIfNotExists = async (invoiceDir: string) => {
  if (!fs.existsSync(invoiceDir)) {
    await fs.promises.mkdir(invoiceDir);
    debug(`InvoiceDir ${invoiceDir} created`)
  }
}

export const startCronjob = async (config: IServerConfig) => {
  try {
    if (!cronjob) {
      await createInvoiceDirIfNotExists(config.invoiceDir);
      afterEventId = persistedData.afterEventId || config.afterEventId;
      cronjob = new CronJob(config.fetchFrequence, async () => {
        try {
          const data = (await fetchInvoicesEvents(config.feedUrl, config.pageSize, afterEventId)).data;
          const payload: IFetchInvoicesEventsPayload = data.payload;
          afterEventId = data.eventId;

          await handlePdfFiles(config.invoiceDir, payload.items);
          persistedData.afterEventId = afterEventId;
          await fs.promises.writeFile(path.resolve(__dirname, "./persistedData.json"), JSON.stringify(persistedData, null, 2));
        } catch(err) {
          debug("fetch error: ", err.toString());
        }
      });
    }
    cronjob.start();
    debug("fetch invoices events cronjob start");
  } catch (error) {
    debug("stateCronjob error: ", error.toString());
  }
}

export const stopCronjob = () => {
  if (cronjob) {
    cronjob.stop();
    cronjob = undefined;
  }
}


