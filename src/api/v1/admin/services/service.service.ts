import slugify from "slugify";
import { Service } from "@models/service.model";
import { ServiceContact } from "@models/service-contact.model";
import { ServiceLink } from "@models/service-link.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

// ── Services CRUD ──
export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["name.fr", "name.en", "category"],
  });

  if (isActive !== undefined) {
    filter.is_active = isActive === "true";
  }

  const [data, total] = await Promise.all([
    Service.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const service = await Service.findById(id).lean();
  if (!service) throw ApiError.notFound("Service");

  const [contacts, links] = await Promise.all([
    ServiceContact.find({ service_id: id }).lean(),
    ServiceLink.find({ service_id: id }).lean(),
  ]);

  return { ...service, contacts, links };
};

export const create = async (data: Record<string, unknown>) => {
  const name = data.name as { fr: string };
  const slug = slugify(name.fr, { lower: true, strict: true });

  const existing = await Service.findOne({ slug });
  if (existing) throw ApiError.conflict("A service with this name already exists");

  const service = await Service.create({ ...data, slug });
  return service.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.name) {
    const name = data.name as { fr: string };
    data.slug = slugify(name.fr, { lower: true, strict: true });
    const existing = await Service.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("A service with this name already exists");
  }

  const service = await Service.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!service) throw ApiError.notFound("Service");
  return service;
};

export const softDelete = async (id: string) => {
  const service = await Service.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  ).lean();

  if (!service) throw ApiError.notFound("Service");
  return service;
};

// ── Service Contacts ──
export const getContacts = async (serviceId: string) => {
  const service = await Service.findById(serviceId);
  if (!service) throw ApiError.notFound("Service");
  return ServiceContact.find({ service_id: serviceId }).lean();
};

export const createContact = async (serviceId: string, data: Record<string, unknown>) => {
  const service = await Service.findById(serviceId);
  if (!service) throw ApiError.notFound("Service");

  const contact = await ServiceContact.create({ ...data, service_id: serviceId });
  return contact.toObject();
};

export const updateContact = async (id: string, data: Record<string, unknown>) => {
  const contact = await ServiceContact.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!contact) throw ApiError.notFound("Service contact");
  return contact;
};

export const deleteContact = async (id: string) => {
  const contact = await ServiceContact.findByIdAndDelete(id);
  if (!contact) throw ApiError.notFound("Service contact");
};

// ── Service Links ──
export const getLinks = async (serviceId: string) => {
  const service = await Service.findById(serviceId);
  if (!service) throw ApiError.notFound("Service");
  return ServiceLink.find({ service_id: serviceId }).lean();
};

export const createLink = async (serviceId: string, data: Record<string, unknown>) => {
  const service = await Service.findById(serviceId);
  if (!service) throw ApiError.notFound("Service");

  const link = await ServiceLink.create({ ...data, service_id: serviceId });
  return link.toObject();
};

export const updateLink = async (id: string, data: Record<string, unknown>) => {
  const link = await ServiceLink.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!link) throw ApiError.notFound("Service link");
  return link;
};

export const deleteLink = async (id: string) => {
  const link = await ServiceLink.findByIdAndDelete(id);
  if (!link) throw ApiError.notFound("Service link");
};
