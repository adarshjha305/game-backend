import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { createLocationHandler, updateLocationHandler } from "./post";
import { deleteLocationHandler, listLocationsHandler } from "./get";

const locationRouter = express.Router();

// create location
locationRouter.post("/create", authenticateHost, createLocationHandler);

// list location
locationRouter.get("/list", authenticateHost, listLocationsHandler);

// update location
locationRouter.post("/update/:id", authenticateHost, updateLocationHandler);

// delete location
locationRouter.get("/delete/:id", authenticateHost, deleteLocationHandler);

export default locationRouter;
