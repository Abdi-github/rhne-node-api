import { Site } from "@models/site.model";
import { Doctor } from "@models/doctor.model";
import { Service } from "@models/service.model";
import { Event } from "@models/event.model";
import { Job } from "@models/job.model";
import { Newborn } from "@models/newborn.model";
import { PatientInfo } from "@models/patient-info.model";
import { User } from "@models/user.model";

export const getDashboardStats = async () => {
  const [
    sitesCount,
    servicesCount,
    doctorsCount,
    eventsCount,
    jobsCount,
    newbornsCount,
    patientInfoCount,
    usersCount,
    activeSitesCount,
    activeServicesCount,
    activeDoctorsCount,
  ] = await Promise.all([
    Site.countDocuments(),
    Service.countDocuments(),
    Doctor.countDocuments(),
    Event.countDocuments(),
    Job.countDocuments(),
    Newborn.countDocuments(),
    PatientInfo.countDocuments(),
    User.countDocuments(),
    Site.countDocuments({ is_active: true }),
    Service.countDocuments({ is_active: true }),
    Doctor.countDocuments({ is_active: true }),
  ]);

  return {
    total: {
      sites: sitesCount,
      services: servicesCount,
      doctors: doctorsCount,
      events: eventsCount,
      jobs: jobsCount,
      newborns: newbornsCount,
      patient_info: patientInfoCount,
      users: usersCount,
    },
    active: {
      sites: activeSitesCount,
      services: activeServicesCount,
      doctors: activeDoctorsCount,
    },
  };
};
