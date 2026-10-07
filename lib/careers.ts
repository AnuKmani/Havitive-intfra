/** Hiring pipeline shared by the admin pages and the reply templates. */
export const APPLICATION_STATUSES = [
  { value: "new", label: "New", tone: "blue" },
  { value: "reviewing", label: "Reviewing", tone: "amber" },
  { value: "shortlisted", label: "Shortlisted", tone: "violet" },
  { value: "interview", label: "Interview", tone: "teal" },
  { value: "offered", label: "Offered", tone: "green" },
  { value: "hired", label: "Hired", tone: "green" },
  { value: "rejected", label: "Not selected", tone: "red" },
  { value: "talent_pool", label: "Talent pool", tone: "grey" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

export const statusInfo = (value: string) => APPLICATION_STATUSES.find((s) => s.value === value) ?? APPLICATION_STATUSES[0];

/** Ready-made replies. {name} and {position} are filled in automatically. */
export const REPLY_TEMPLATES = [
  {
    key: "received", label: "Application received", status: "reviewing",
    subject: "Your application for {position} – Havitive",
    body: "Dear {name},\n\nThank you for applying for the {position} position at Havitive Infra. We have received your application and our team is reviewing it.\n\nWe will get back to you soon.\n\nBest regards,\nHR Team\nHavitive Infra Pvt Ltd",
  },
  {
    key: "shortlisted", label: "Shortlisted", status: "shortlisted",
    subject: "You have been shortlisted – {position}",
    body: "Dear {name},\n\nGood news! Your application for the {position} position has been shortlisted. Our team will contact you shortly to discuss the next steps.\n\nBest regards,\nHR Team\nHavitive Infra Pvt Ltd",
  },
  {
    key: "interview", label: "Interview invitation", status: "interview",
    subject: "Interview invitation – {position}",
    body: "Dear {name},\n\nWe would like to invite you for an interview for the {position} position.\n\nDate: \nTime: \nVenue: Havitive Infra Pvt Ltd, Kazhakkoottam, Thiruvananthapuram (or online link: )\n\nPlease reply to confirm your availability and bring a copy of your CV and portfolio.\n\nBest regards,\nHR Team\nHavitive Infra Pvt Ltd",
  },
  {
    key: "offer", label: "Offer", status: "offered",
    subject: "Offer for the {position} position – Havitive",
    body: "Dear {name},\n\nWe are pleased to offer you the {position} position at Havitive Infra. Please find the details below and reply to confirm.\n\nJoining date: \nSalary: \n\nWe look forward to welcoming you to the team.\n\nBest regards,\nHR Team\nHavitive Infra Pvt Ltd",
  },
  {
    key: "rejected", label: "Not selected", status: "rejected",
    subject: "Your application for {position} – Havitive",
    body: "Dear {name},\n\nThank you for your interest in the {position} position and for the time you spent applying. After careful review, we have decided to move forward with other candidates.\n\nWe will keep your CV on file and contact you if a suitable role opens.\n\nBest wishes,\nHR Team\nHavitive Infra Pvt Ltd",
  },
  {
    key: "talent", label: "Added to talent pool", status: "talent_pool",
    subject: "Thank you for your CV – Havitive",
    body: "Dear {name},\n\nThank you for sharing your CV with Havitive Infra. We don't have a matching opening right now, but we have added you to our talent network and will contact you when a suitable position opens.\n\nBest regards,\nHR Team\nHavitive Infra Pvt Ltd",
  },
] as const;
