import { Site } from "@models/site.model";
import { Service } from "@models/service.model";
import { Doctor } from "@models/doctor.model";
import { Event } from "@models/event.model";
import { Job } from "@models/job.model";
import { PatientInfo } from "@models/patient-info.model";

interface SearchOptions {
  q: string;
  limit: number;
  resources?: string[];
}

interface SearchResultItem {
  type: string;
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  image_url?: string;
}

interface SearchResults {
  query: string;
  total: number;
  results: SearchResultItem[];
}

const SEARCHABLE_RESOURCES = ["sites", "services", "doctors", "events", "jobs", "patient-info"];

export const search = async (options: SearchOptions): Promise<SearchResults> => {
  const { q, limit, resources } = options;
  const regex = new RegExp(q, "i");

  // Determine which resources to search
  const targets = resources
    ? resources.filter((r) => SEARCHABLE_RESOURCES.includes(r))
    : SEARCHABLE_RESOURCES;

  const perResourceLimit = Math.max(3, Math.ceil(limit / targets.length));
  const promises: Promise<SearchResultItem[]>[] = [];

  if (targets.includes("sites")) {
    promises.push(
      Site.find({
        is_active: true,
        $or: [
          { name: regex },
          { city: regex },
          { "type.fr": regex },
          { "type.en": regex },
          { "type.de": regex },
          { "type.it": regex },
        ],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "site",
            id: d._id.toString(),
            slug: d.slug,
            title: d.name,
            subtitle: `${d.city} — ${d.type?.fr || ""}`,
            image_url: d.image_url || undefined,
          }))
        )
    );
  }

  if (targets.includes("services")) {
    promises.push(
      Service.find({
        is_active: true,
        $or: [
          { "name.fr": regex },
          { "name.en": regex },
          { "name.de": regex },
          { "name.it": regex },
          { category: regex },
        ],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "service",
            id: d._id.toString(),
            slug: d.slug,
            title: d.name?.fr || "",
            subtitle: d.category || undefined,
            image_url: d.image_url || undefined,
          }))
        )
    );
  }

  if (targets.includes("doctors")) {
    promises.push(
      Doctor.find({
        is_active: true,
        $or: [{ name: regex }, { service_name: regex }],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "doctor",
            id: d._id.toString(),
            title: `${d.title ? d.title + " " : ""}${d.name}`,
            subtitle: d.service_name || undefined,
            image_url: d.image_url || undefined,
          }))
        )
    );
  }

  if (targets.includes("events")) {
    promises.push(
      Event.find({
        is_active: true,
        $or: [
          { "title.fr": regex },
          { "title.en": regex },
          { "title.de": regex },
          { "title.it": regex },
        ],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "event",
            id: d._id.toString(),
            slug: d.slug,
            title: d.title?.fr || "",
            subtitle: d.date || undefined,
          }))
        )
    );
  }

  if (targets.includes("jobs")) {
    promises.push(
      Job.find({
        is_active: true,
        $or: [
          { "title.fr": regex },
          { "title.en": regex },
          { "title.de": regex },
          { "title.it": regex },
          { category: regex },
          { department: regex },
        ],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "job",
            id: d._id.toString(),
            title: d.title?.fr || "",
            subtitle: d.category || undefined,
          }))
        )
    );
  }

  if (targets.includes("patient-info")) {
    promises.push(
      PatientInfo.find({
        $or: [
          { "title.fr": regex },
          { "title.en": regex },
          { "title.de": regex },
          { "title.it": regex },
          { section: regex },
        ],
      })
        .limit(perResourceLimit)
        .lean()
        .then((docs) =>
          docs.map((d) => ({
            type: "patient-info",
            id: d._id.toString(),
            slug: d.slug,
            title: d.title?.fr || "",
            subtitle: d.section || undefined,
            image_url: d.image_url || undefined,
          }))
        )
    );
  }

  const resultArrays = await Promise.all(promises);
  const allResults = resultArrays.flat().slice(0, limit);

  return {
    query: q,
    total: allResults.length,
    results: allResults,
  };
};
