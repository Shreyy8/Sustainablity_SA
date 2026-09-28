export interface ActivityDefinition {
  key: string;
  domain: string;
  label: string;
  description: string;
  scheduleVii: string;
  sdgs: number[];
}

export const ACTIVITY_TAXONOMY: Record<string, ActivityDefinition> = {
  // WASH
  borewell_handpump: {
    key: "borewell_handpump",
    domain: "WASH",
    label: "Borewell & Hand Pump",
    description: "Hand pump or borewell with concrete platform and drainage channel for clean drinking water",
    scheduleVii: "Item (i) - Eradicating hunger, poverty, sanitation, making available safe drinking water",
    sdgs: [6, 3]
  },
  toilet_block: {
    key: "toilet_block",
    domain: "WASH",
    label: "Sanitation & Toilet Block",
    description: "Toilet or latrine structure built for school, anganwadi, or rural community use",
    scheduleVii: "Item (i) - Promoting health care including preventive health care and sanitation",
    sdgs: [6, 3, 5]
  },
  handwashing_station: {
    key: "handwashing_station",
    domain: "WASH",
    label: "Handwashing Station",
    description: "Multi-tap handwashing unit with soap dispensers, concrete base, and piped supply, frequently used by school children",
    scheduleVii: "Item (i) - Sanitation and safe drinking water",
    sdgs: [6, 3]
  },
  water_tank: {
    key: "water_tank",
    domain: "WASH",
    label: "Water Storage Tank",
    description: "Overhead Sintex or concrete ground water storage reservoir serving village or institution",
    scheduleVii: "Item (i) - Safe drinking water",
    sdgs: [6]
  },
  water_purifier: {
    key: "water_purifier",
    domain: "WASH",
    label: "Water Filtration System",
    description: "Community RO plant or institutional UV/UF water purification kiosk with dispensing tap",
    scheduleVii: "Item (i) - Safe drinking water",
    sdgs: [6, 3]
  },

  // Education
  classroom_construction: {
    key: "classroom_construction",
    domain: "Education",
    label: "Classroom Construction / Repair",
    description: "School building under brickwork, roofing, plastering, whitewashing, or completed furnished classroom",
    scheduleVii: "Item (ii) - Promoting education including special education and employment enhancing vocational skills",
    sdgs: [4]
  },
  smart_class: {
    key: "smart_class",
    domain: "Education",
    label: "Smart Classroom Setup",
    description: "Digital board, smart TV, projector, interactive display, and power backup installed in classroom",
    scheduleVii: "Item (ii) - Promoting education and technology-enabled learning",
    sdgs: [4, 9]
  },
  library: {
    key: "library",
    domain: "Education",
    label: "School Library",
    description: "Bookshelves with grade-level story books, reading benches, and literacy corners",
    scheduleVii: "Item (ii) - Promoting education and literacy",
    sdgs: [4]
  },
  science_lab: {
    key: "science_lab",
    domain: "Education",
    label: "STEM & Science Lab",
    description: "Laboratory tables with test tubes, microscopes, solar models, and STEM learning kits",
    scheduleVii: "Item (ii) - Promoting education and science learning",
    sdgs: [4]
  },
  school_desks: {
    key: "school_desks",
    domain: "Education",
    label: "Classroom Furniture & Desks",
    description: "Dual desks, student benches, teacher tables, and green chalkboards delivered to school",
    scheduleVii: "Item (ii) - Promoting education infrastructure",
    sdgs: [4]
  },

  // Environment
  plantation: {
    key: "plantation",
    domain: "Environment",
    label: "Afforestation & Tree Plantation",
    description: "Saplings planted in dig pits with tree guards, mulching, drip lines, or community nursery",
    scheduleVii: "Item (iv) - Ensuring environmental sustainability, ecological balance, agroforestry",
    sdgs: [13, 15]
  },
  pond_rejuvenation: {
    key: "pond_rejuvenation",
    domain: "Environment",
    label: "Pond Rejuvenation & Desilting",
    description: "Excavator desilting earthen village pond, deepened water reservoir with stone pitching and inlet channels",
    scheduleVii: "Item (iv) - Conservation of natural resources and maintaining quality of soil and water",
    sdgs: [6, 13, 15]
  },
  rainwater_harvesting: {
    key: "rainwater_harvesting",
    domain: "Environment",
    label: "Rooftop Rainwater Harvesting",
    description: "Gutters, downpipes, first-flush diverter, sand filter, and recharge recharge pit or storage sump",
    scheduleVii: "Item (iv) - Water conservation and ecological balance",
    sdgs: [6, 13]
  },
  solar_install: {
    key: "solar_install",
    domain: "Environment",
    label: "Solar Panel Installation",
    description: "Rooftop photovoltaic solar panels, inverter station, and battery racks installed at community facility",
    scheduleVii: "Item (iv) - Environmental sustainability and renewable energy",
    sdgs: [7, 13]
  },

  // Health
  health_camp: {
    key: "health_camp",
    domain: "Health",
    label: "Mobile Health Camp",
    description: "Medical checkup camp with doctors, examination desks, patient queues, BP monitor, and free diagnostic kits",
    scheduleVii: "Item (i) - Promoting health care including preventive health care",
    sdgs: [3]
  },
  ambulance: {
    key: "ambulance",
    domain: "Health",
    label: "Ambulance / Mobile Medical Unit",
    description: "Fully equipped mobile health dispensary van or ambulance with signage and emergency equipment",
    scheduleVii: "Item (i) - Promoting healthcare and emergency medical access",
    sdgs: [3]
  },
  nutrition_distribution: {
    key: "nutrition_distribution",
    domain: "Health",
    label: "Maternal & Child Nutrition Support",
    description: "Distribution of fortified ration packs, iron supplements, and growth monitoring at Anganwadi",
    scheduleVii: "Item (i) - Eradicating hunger, poverty, malnutrition",
    sdgs: [2, 3]
  },
  vision_screening: {
    key: "vision_screening",
    domain: "Health",
    label: "Eye Care & Vision Screening",
    description: "Snellen eye chart examination, refraction checkup, and distribution of prescription spectacles",
    scheduleVii: "Item (i) - Preventive health care",
    sdgs: [3]
  },

  // Livelihood
  skill_training: {
    key: "skill_training",
    domain: "Livelihood",
    label: "Vocational Skill Training",
    description: "Classroom workshop with sewing machines, computer literacy lab, or electrical repair benches with trainees",
    scheduleVii: "Item (ii) - Employment enhancing vocation skills especially among women and youth",
    sdgs: [8, 5, 4]
  },
  self_help_group: {
    key: "self_help_group",
    domain: "Livelihood",
    label: "Women Self-Help Group (SHG)",
    description: "Women entrepreneurs gathered with micro-enterprise goods, record books, passbooks, and packaging work",
    scheduleVii: "Item (iii) - Promoting gender equality, empowering women",
    sdgs: [5, 8]
  },
  agricultural_training: {
    key: "agricultural_training",
    domain: "Livelihood",
    label: "Sustainable Agriculture Training",
    description: "Farmer field demonstration on vermicomposting, organic fertilizer, seed treatment, and sprinkler irrigation",
    scheduleVii: "Item (ii) - Livelihood enhancement projects",
    sdgs: [1, 2, 8]
  },

  // Infrastructure
  community_hall: {
    key: "community_hall",
    domain: "Infrastructure",
    label: "Community Centre / Panchayat Hall",
    description: "Panchayat meeting hall with tiled floor, ceiling fans, public address system, and signage board",
    scheduleVii: "Item (x) - Rural development projects",
    sdgs: [9, 11]
  },
  anganwadi_renovation: {
    key: "anganwadi_renovation",
    domain: "Infrastructure",
    label: "Anganwadi Center Modernization",
    description: "BALA painted walls, child-friendly toilet, play flooring, and learning toys at government child care centre",
    scheduleVii: "Item (i) & (ii) - Rural development, child care, and early education",
    sdgs: [3, 4]
  },
  street_light: {
    key: "street_light",
    domain: "Infrastructure",
    label: "Solar Street Lighting",
    description: "Standalone LED solar street lamp post with solar module and battery box along village lane",
    scheduleVii: "Item (x) - Rural development projects",
    sdgs: [7, 11]
  },

  // Community
  awareness_session: {
    key: "awareness_session",
    domain: "Community",
    label: "Community Awareness & Gram Sabha",
    description: "Villagers attending sanitation or health awareness gathering, informational banners, and street theatre",
    scheduleVii: "Item (i) - Preventive healthcare and sanitation awareness",
    sdgs: [3, 6, 17]
  }
};

export const TAXONOMY_KEYS = Object.keys(ACTIVITY_TAXONOMY);

export function getActivityDefinition(key: string): ActivityDefinition | undefined {
  return ACTIVITY_TAXONOMY[key];
}

export function getAllActivities(): ActivityDefinition[] {
  return Object.values(ACTIVITY_TAXONOMY);
}

export function getActivitiesByDomain(domain: string): ActivityDefinition[] {
  return Object.values(ACTIVITY_TAXONOMY).filter(a => a.domain.toLowerCase() === domain.toLowerCase());
}
