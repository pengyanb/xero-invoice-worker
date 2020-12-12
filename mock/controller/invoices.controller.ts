import { Request, Response } from "express";
import cloneDeep from "clone-deep";
import { v4 as uuidv4 } from "uuid";
import { IInvoiceItem, IInvoiceContentCreateNUpdate } from "../../server/cronjob";
import mockDataTemplate from "../mockDataTemplate.json";

const debug = require("debug")("mock:controller:invoices");
const CONST_MAX_INVOICE_COUNT = 500;
const CONST_INVOICE_STATUS = ["DRAFT", "SENT", "PAID", "DELETED"];
const CONST_INVOICE_TYPE = ["INVOICE_CREATED", "INVOICE_UPDATED", "INVOICE_DELETED"];

const CONST_EXISTING_INVOCIE_IDs: string[] = [];

export const events = async (req: Request, res: Response) => {
  const pageSize: number = parseInt(req.query.pageSize as string) || 10;
  const afterEventId: number = parseInt(req.query.afterEventId as string) || 0;
  const invoiceCount = Math.floor(Math.random() * Math.min(CONST_MAX_INVOICE_COUNT, pageSize)) + 1;

  debug('query: ', req.query, invoiceCount);

  const items: IInvoiceItem[] = [];
  const payload : { "items" : IInvoiceItem [] } = { items };

  Array(invoiceCount).fill(0).map((_, index) => {
    const item: IInvoiceItem = cloneDeep(mockDataTemplate);
    const invoiceType = CONST_INVOICE_TYPE[Math.floor(Math.random() * CONST_INVOICE_TYPE.length)];
    const invoiceStatus = CONST_INVOICE_STATUS[Math.floor(Math.random() * CONST_INVOICE_STATUS.length)];
    item.type = invoiceType;
    item.id = afterEventId + index + 1;
    if (invoiceType === "INVOICE_DELETED"){
      item.content = {
        invoiceId: CONST_EXISTING_INVOCIE_IDs.length > 0 ? 
        CONST_EXISTING_INVOCIE_IDs.splice(Math.floor(Math.random() * CONST_EXISTING_INVOCIE_IDs.length), 1)[0] : uuidv4()
      };
    } else {
      if (invoiceType === "INVOICE_CREATED") {
        item.content.invoiceId = uuidv4();
        CONST_EXISTING_INVOCIE_IDs.push(item.content.invoiceId);
      } else {
        item.content.invoiceId = CONST_EXISTING_INVOCIE_IDs.length > 0 ? 
        CONST_EXISTING_INVOCIE_IDs[Math.floor(Math.random() * CONST_EXISTING_INVOCIE_IDs.length)] : uuidv4();
      }
      
      (item.content as IInvoiceContentCreateNUpdate).status = invoiceStatus;
      (item.content as IInvoiceContentCreateNUpdate).invoiceNumber = `INV-${("000"+item.id).slice(-4)}`;
      (item.content as IInvoiceContentCreateNUpdate).lineItems.map(lineItem => {
        lineItem.lineItemId = uuidv4();
        lineItem.quantity = Math.floor(Math.random() * 11);
        lineItem.unitCost = parseFloat(("" + (Math.random() * 100)).slice(0, 5));
        lineItem.lineItemTotalCost = lineItem.quantity * lineItem.unitCost;
      });
    }
    payload.items.push(item)
  });
  res.json({
    payload,
    eventId: afterEventId + invoiceCount
  });
}