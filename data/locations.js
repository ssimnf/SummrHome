export const LOCAL_TOWNS = [
  {
    city: 'Sreerampore',
    district: 'Hooghly',
    lat: 22.7525,
    lng: 88.3422,
    neighborhoods: [
      'Mahesh',
      'Serampore College Gate',
      'Battala',
      'Sheoraphuli',
      'Chatra',
      'Bagbazar Ghat',
      'Rishra Border',
    ],
    colleges: [
      'Serampore College',
      'Government College of Engineering & Textile Technology (GCETTS)',
      "Serampore Girls' College",
      'Mahesh Sri Ramakrishna Ashram College',
      'Serampore Polytechnic Institute',
      'Serampore Law & Commerce Academy',
    ],
  },
  {
    city: 'Rishra',
    district: 'Hooghly',
    lat: 22.7124,
    lng: 88.3496,
    neighborhoods: [
      'Rishra Station Road',
      'Bangur Park',
      'Morepukur',
      'Hastings Mill Area',
      'N.S. Road',
    ],
    colleges: [
      'Bidhan Chandra College, Rishra',
      'Rishra Vidyapith College',
      'Rishra Polytechnic Institute',
      'Morepukur Netaji Subhas College',
      'Rishra Nursing & Allied Health Academy',
      'Serampore College (Rishra Border)',
    ],
  },
  {
    city: 'Uttarpara',
    district: 'Hooghly',
    lat: 22.6634,
    lng: 88.3484,
    neighborhoods: [
      'Hindmotor',
      'Kotrung',
      'Bhadrakali',
      'Makhla',
      'Uttarpara Station',
    ],
    colleges: [
      'Raja Peary Mohan College',
      'Uttarpara Polytechnic',
      "Swami Niswambalananda Girls' College",
      'Hindmotor Technical Training Institute',
      'Bhadrakali B.Ed. College',
      'Makhla Institute of Management & IT',
    ],
  },
  {
    city: 'Chinsurah',
    district: 'Hooghly',
    lat: 22.9012,
    lng: 88.3967,
    neighborhoods: [
      'Hooghly Mohsin College Rd',
      'Ghutiabazar',
      'Pipulpati',
      'Bandel More',
      'Taldanga',
    ],
    colleges: [
      'Hooghly Mohsin College',
      'Hooghly Engineering & Technology College (HETC)',
      "Hooghly Women's College",
      'Hooghly Institute of Technology (HIT)',
      'Hooghly Nursing & Paramedical College',
      'Rabindra Mahavidyalaya (Chinsurah)',
    ],
  },
  {
    city: 'Chandannagar',
    district: 'Hooghly',
    lat: 22.8671,
    lng: 88.3674,
    neighborhoods: [
      'Strand Road',
      'Mankundu',
      'Fatakgora',
      'Khalisani',
      'Boro Bazar',
    ],
    colleges: [
      'Chandernagore Government College',
      'Khalisani Mahavidyalaya',
      'Supreme Knowledge Foundation (SKFGI Mankundu)',
      'Chandannagar Law & Management Institute',
      'Techno India Hooghly Campus',
      "Sarojini Naidu Women's College (Chandannagar)",
    ],
  },
  {
    city: 'Konnagar',
    district: 'Hooghly',
    lat: 22.6997,
    lng: 88.3522,
    neighborhoods: ['Nabagram', 'Konnagar Station', 'Masterpara', 'CS Mukherjee St'],
    colleges: [
      'Nabagram Hiralal Paul College',
      'Konnagar Rajendra Smriti Mahavidyalaya',
      'Konnagar Technical & IT Polytechnic',
      'Nabagram B.Ed. College',
      'Konnagar College of Commerce & Science',
    ],
  },
  {
    city: 'Kolkata',
    district: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    neighborhoods: [
      'Jadavpur',
      'Salt Lake Sector V',
      'College Street',
      'Ballygunge',
      'Dum Dum',
      'Behala',
    ],
    colleges: [
      'Jadavpur University',
      'University of Calcutta (College Street)',
      'Techno India University (Salt Lake)',
      'Institute of Engineering & Management (IEM)',
      'Presidency University',
      "St. Xavier's College Kolkata",
    ],
  },
  {
    city: 'Howrah',
    district: 'Howrah',
    lat: 22.5958,
    lng: 88.2636,
    neighborhoods: [
      'Shibpur (IIEST)',
      'Belur Math',
      'Bally',
      'Salkia',
      'Santragachi',
    ],
    colleges: [
      'IIEST Shibpur',
      'Ramakrishna Mission Vidyamandira (Belur)',
      'Narasinha Dutt College',
      "Bijoy Krishna Girls' College",
      'Lal Baba College (Belur)',
      'MCKV Institute of Engineering (Liluah)',
    ],
  },
];

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function resolveNearestTown(lat, lng) {
  let nearest = LOCAL_TOWNS[0];
  let bestDist = Infinity;
  for (const town of LOCAL_TOWNS) {
    const dist = haversineKm(lat, lng, town.lat, town.lng);
    if (dist < bestDist) {
      bestDist = dist;
      nearest = town;
    }
  }
  return nearest;
}

export async function reverseGeocodePosition(lat, lng) {
  const nearest = resolveNearestTown(lat, lng);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const detectedCity =
        addr.town ||
        addr.city ||
        addr.municipality ||
        addr.suburb ||
        nearest.city;
      const detectedNeighborhood =
        addr.neighbourhood ||
        addr.suburb ||
        addr.quarter ||
        addr.road ||
        nearest.neighborhoods[0];
      const detectedDistrict =
        addr.state_district || addr.county || nearest.district;

      return {
        city: detectedCity,
        district: detectedDistrict.replace(' District', ''),
        neighborhood: detectedNeighborhood,
        lat,
        lng,
        detectionMethod: 'gps',
      };
    }
  } catch {
    // Fallback cleanly to coordinate-matched local town
  }

  return {
    city: nearest.city,
    district: nearest.district,
    neighborhood: nearest.neighborhoods[0],
    lat,
    lng,
    detectionMethod: 'gps',
  };
}

export function getTownNeighborhoods(city) {
  const match = LOCAL_TOWNS.find(
    (t) => t.city.toLowerCase() === city.toLowerCase()
  );
  if (match) return match.neighborhoods;
  return [
    'Station Road',
    'College Gate',
    'Main Bazar',
    'Central Para',
    'New Colony',
  ];
}

export function getTownColleges(city) {
  const match = LOCAL_TOWNS.find(
    (t) => t.city.toLowerCase() === city.toLowerCase()
  );
  if (match) return match.colleges;
  return [
    `${city} Government College`,
    `${city} Polytechnic Institute`,
    `${city} Degree College`,
    `${city} Women's College`,
    `${city} Institute of Technology`,
  ];
}
