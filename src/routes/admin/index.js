import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { createAdminHandler, deleteAdminHandler, loginAdminHandler, updateAdminHandler } from "./post";
import { infoAdminHandler, listAdminHandler } from "./get";

const adminRoute = Router();

// Create ADMIN
adminRoute.post(`/create`, privateKeyMiddleware, createAdminHandler); // DONE

// Login ADMIN
adminRoute.post(`/login`, privateKeyMiddleware, loginAdminHandler); //DONE

// Update ADMIN
adminRoute.post(`/update/:id`, privateKeyMiddleware, updateAdminHandler);

// Delete ADMIN
adminRoute.post(`/delete/:id`, privateKeyMiddleware, deleteAdminHandler);

// Get ADMIN INFO
adminRoute.get(`/info/:id`, privateKeyMiddleware, infoAdminHandler);

// List ADMIN
adminRoute.get(`/list`, privateKeyMiddleware, listAdminHandler);

export default adminRoute;
