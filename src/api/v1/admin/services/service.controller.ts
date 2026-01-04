import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as serviceService from "./service.service";

// ── Services CRUD ──
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await serviceService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Services retrieved successfully", result.data, result.pagination);
});

export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getById(req.params.id);
  sendSuccess(res, "Service retrieved successfully", service);
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.create(req.body);
  sendCreated(res, "Service created successfully", service);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.update(req.params.id, req.body);
  sendSuccess(res, "Service updated successfully", service);
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.softDelete(req.params.id);
  sendSuccess(res, "Service deleted successfully", null);
});

// ── Service Contacts ──
export const getServiceContacts = asyncHandler(async (req: Request, res: Response) => {
  const contacts = await serviceService.getContacts(req.params.id);
  sendSuccess(res, "Service contacts retrieved successfully", contacts);
});

export const createServiceContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await serviceService.createContact(req.params.id, req.body);
  sendCreated(res, "Service contact created successfully", contact);
});

export const updateServiceContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await serviceService.updateContact(req.params.id, req.body);
  sendSuccess(res, "Service contact updated successfully", contact);
});

export const deleteServiceContact = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteContact(req.params.id);
  sendSuccess(res, "Service contact deleted successfully", null);
});

// ── Service Links ──
export const getServiceLinks = asyncHandler(async (req: Request, res: Response) => {
  const links = await serviceService.getLinks(req.params.id);
  sendSuccess(res, "Service links retrieved successfully", links);
});

export const createServiceLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await serviceService.createLink(req.params.id, req.body);
  sendCreated(res, "Service link created successfully", link);
});

export const updateServiceLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await serviceService.updateLink(req.params.id, req.body);
  sendSuccess(res, "Service link updated successfully", link);
});

export const deleteServiceLink = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteLink(req.params.id);
  sendSuccess(res, "Service link deleted successfully", null);
});
