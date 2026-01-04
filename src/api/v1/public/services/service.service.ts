import { Service } from "@models/service.model";
import { ServiceContact } from "@models/service-contact.model";
import { ServiceLink } from "@models/service-link.model";
import { ServiceBrochure } from "@models/service-brochure.model";
import { Doctor } from "@models/doctor.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllServices = async (
  options: PaginationOptions,
  queryFilters: { category?: string; site?: string }
) => {
  const filters: Record<string, unknown> = {};

  if (queryFilters.category) {
    filters.category = queryFilters.category;
  }

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    filters,
    activeOnly: true,
    searchFields: ["name.fr", "name.en", "name.de", "name.it", "category"],
  });

  // If filtering by site, we need to find services that have contacts at that site
  if (queryFilters.site) {
    const contacts = await ServiceContact.find({ site_id: queryFilters.site }).distinct("service_id");
    filter._id = { $in: contacts };
  }

  const [data, total] = await Promise.all([
    Service.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getServiceBySlug = async (slug: string) => {
  const service = await Service.findOne({ slug, is_active: true }).lean();

  if (!service) {
    throw ApiError.notFound("Service");
  }

  // Fetch related data in parallel
  const [contacts, links, brochures, doctors] = await Promise.all([
    ServiceContact.find({ service_id: service._id }).lean(),
    ServiceLink.find({ service_id: service._id }).lean(),
    ServiceBrochure.find({ service_id: service._id }).lean(),
    Doctor.find({ service_id: service._id, is_active: true }).lean(),
  ]);

  return {
    ...service,
    contacts,
    links,
    brochures,
    doctors,
  };
};
