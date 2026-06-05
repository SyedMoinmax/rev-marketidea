export const CANADIAN_PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];

export const CANADIAN_CITIES = {
  ON: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
  BC: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Kelowna", "Abbotsford", "Victoria", "Coquitlam", "Langley"],
  QC: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Levis"],
  AB: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie"],
  MB: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],
  SK: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current"],
  NS: ["Halifax", "Dartmouth", "Sydney", "Truro", "New Glasgow"],
  NB: ["Moncton", "Saint John", "Fredericton", "Miramichi", "Edmundston"],
  NL: ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South"],
  PE: ["Charlottetown", "Summerside", "Stratford"],
  NT: ["Yellowknife", "Hay River", "Inuvik"],
  NU: ["Iqaluit", "Rankin Inlet", "Arviat"],
  YT: ["Whitehorse", "Dawson City", "Watson Lake"]
};

export const SERVICE_CATEGORIES = [
  {
    id: "real_estate", name: "Real Estate", icon: "Building2",
    subcategories: ["Apartment Rental", "House Purchase", "Commercial Lease", "Property Management", "Mortgage Brokerage", "Home Inspection"]
  },
  {
    id: "home_services", name: "Home Services", icon: "Wrench",
    subcategories: ["Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Flooring", "Landscaping", "Cleaning", "Moving", "Renovation"]
  },
  {
    id: "automotive", name: "Automotive", icon: "Car",
    subcategories: ["Car Purchase Assistance", "Auto Repair", "Auto Detailing", "Towing", "Auto Insurance", "Vehicle Inspection"]
  },
  {
    id: "professional_services", name: "Professional Services", icon: "Briefcase",
    subcategories: ["Legal Consultation", "Accounting", "Financial Planning", "Business Consulting", "HR Services", "Immigration Services"]
  },
  {
    id: "technology", name: "Technology Services", icon: "Monitor",
    subcategories: ["Web Development", "Mobile App Development", "IT Support", "Cybersecurity", "Cloud Services", "Data Analytics", "UI/UX Design"]
  },
  {
    id: "personal_services", name: "Personal Services", icon: "Heart",
    subcategories: ["Personal Training", "Nutrition Coaching", "Photography", "Tutoring", "Event Planning", "Hair & Beauty", "Pet Services"]
  },
  {
    id: "commercial", name: "Commercial Services", icon: "Store",
    subcategories: ["Commercial Cleaning", "Security Services", "Logistics", "Supply Chain", "Staffing", "Commercial Renovation"]
  }
];

export const VALIDATION_STATUS_CONFIG = {
  green: {
    label: "Competitive",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    dot: "bg-green-500"
  },
  yellow: {
    label: "Needs Attention",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-500"
  },
  red: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500"
  },
  pending: {
    label: "Validating",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500"
  }
};

export const SCORE_LABELS = {
  excellent: { min: 85, label: "Excellent", color: "text-green-600" },
  good: { min: 70, label: "Good", color: "text-blue-600" },
  fair: { min: 55, label: "Fair", color: "text-yellow-600" },
  poor: { min: 0, label: "Needs Improvement", color: "text-red-600" }
};

export const getScoreLabel = (score) => {
  if (score >= 85) return SCORE_LABELS.excellent;
  if (score >= 70) return SCORE_LABELS.good;
  if (score >= 55) return SCORE_LABELS.fair;
  return SCORE_LABELS.poor;
};