export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  stakeholderEmail: string;
  status: "not done" | "done";
}

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "VP of Analytics",
    company: "TechCorp Solutions",
    linkedinUrl: "https://linkedin.com/in/sarah-johnson",
    stakeholderEmail: "john.doe@mathco.com",
    status: "not done"
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Director of Data Science",
    company: "InnovateTech Inc",
    linkedinUrl: "https://linkedin.com/in/michael-chen",
    stakeholderEmail: "john.doe@mathco.com",
    status: "not done"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    title: "Chief Technology Officer",
    company: "Future Systems",
    linkedinUrl: "https://linkedin.com/in/emily-rodriguez",
    stakeholderEmail: "john.doe@mathco.com",
    status: "not done"
  },
  {
    id: "4",
    name: "David Kim",
    title: "Senior Data Analyst",
    company: "Analytics Plus",
    linkedinUrl: "https://linkedin.com/in/david-kim",
    stakeholderEmail: "jane.smith@mathco.com",
    status: "not done"
  },
  {
    id: "5",
    name: "Lisa Thompson",
    title: "Head of Business Intelligence",
    company: "DataDriven Corp",
    linkedinUrl: "https://linkedin.com/in/lisa-thompson",
    stakeholderEmail: "jane.smith@mathco.com",
    status: "not done"
  }
];