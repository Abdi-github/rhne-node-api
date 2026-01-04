import { PatientInfo } from "@models/patient-info.model";
import { buildPagination, getSkip, parseSortString } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";
import slugify from "slugify";

export const getAll = async (options: PaginationOptions, section?: string) => {
  const { page, limit, search, sort } = options;
  const skip = getSkip(page, limit);

  const filter: Record<string, unknown> = {};

  if (section) filter.section = section;

  if (search) {
    filter.$or = [
      { "title.fr": { $regex: search, $options: "i" } },
      { "title.en": { $regex: search, $options: "i" } },
      { section: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = parseSortString(sort || "section");

  const [data, total] = await Promise.all([
    PatientInfo.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    PatientInfo.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const info = await PatientInfo.findById(id).lean();
  if (!info) throw ApiError.notFound("Patient info page");
  return info;
};

export const create = async (data: Record<string, unknown>) => {
  const titleObj = data.title as { fr: string };
  if (!data.slug && titleObj?.fr) {
    data.slug = slugify(titleObj.fr, { lower: true, strict: true });
  }

  const existing = await PatientInfo.findOne({ slug: data.slug });
  if (existing) throw ApiError.conflict("A patient info page with this slug already exists");

  const info = await PatientInfo.create(data);
  return info.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.slug) {
    const existing = await PatientInfo.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("A patient info page with this slug already exists");
  } else if (data.title) {
    const titleObj = data.title as { fr: string };
    if (titleObj?.fr) {
      data.slug = slugify(titleObj.fr, { lower: true, strict: true });
    }
  }

  const info = await PatientInfo.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!info) throw ApiError.notFound("Patient info page");
  return info;
};

export const remove = async (id: string) => {
  const info = await PatientInfo.findByIdAndDelete(id).lean();
  if (!info) throw ApiError.notFound("Patient info page");
  return info;
};
