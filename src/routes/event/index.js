import { Router } from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { createEventHandler, updateEventHandler } from "./post";
import {
  deleteEventHandler,
  listEventHandler,
  singleEventHandler,
} from "./get";

const eventRouter = Router();

// create event
eventRouter.post("/create", authenticateHost, createEventHandler);

// list event
eventRouter.get("/list", authenticateHost, listEventHandler);

// update event
eventRouter.post("/update/:id", authenticateHost, updateEventHandler);

// delete event
eventRouter.get("/delete/:id", authenticateHost, deleteEventHandler);

// single event
eventRouter.get("/single/:id", authenticateHost, singleEventHandler);

export default eventRouter;
