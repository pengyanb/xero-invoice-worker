import { Router } from "express";
import { events } from "../controller/invoices.controller";

const route = Router();

route.get("/events", events);

export default route;