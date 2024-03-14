import express from "express";
import { createVenueHandler, updateVenueHandler } from "./post";
import { deleteVenueHandler, listVenueHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const venueRouter = express.Router();

// create venue
venueRouter.post("/create", authenticateHost, createVenueHandler);

// list venue
venueRouter.get("/list", authenticateHost, listVenueHandler);

// update venue
venueRouter.post("/update/:id", authenticateHost, updateVenueHandler);

// delete venue
venueRouter.get("/delete/:id", authenticateHost, deleteVenueHandler);

export default venueRouter;
