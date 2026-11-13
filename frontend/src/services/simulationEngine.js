/**
 * ChargeAtlas India — Highway EV Route & Elevation Energy Simulator Engine
 * 
 * Implements physics-based energy consumption modeling:
 * 1. Rolling & aerodynamic resistance on Indian expressways (100-120 km/h)
 * 2. Gravitational potential energy (m * g * dh) across Western Ghats topographical gradients
 * 3. Regenerative braking recovery efficiency (eta_regen = 0.65)
 * 4. Ambient temperature HVAC thermal derating (0.7% / °C above 25°C)
 * 5. Off-corridor interchange detour penalty (+18 min) & DC fast-charge dwell time
 * 
 * Standards: MoP September 2024 Guidelines & ARAI Real-World Testing Benchmarks
 */

// -----------------------------------------------------------------------------
// AUTHENTIC VEHICLE SPECIFICATIONS
// -----------------------------------------------------------------------------
export const VEHICLE_MODELS = [
  {
    id: 'nexon-ev',
    name: 'Tata Nexon EV Empowered+',
    segment: '4W Passenger (Compact SUV)',
    batteryKWh: 40.5,
    usableKWh: 38.5,
    baseConsumptionWhKm: 150,
    curbWeightKg: 1400,
    maxDcChargeKW: 50,
    chargeCurveType: 'stepped', // 50kW to 60%, 30kW to 80%
    dragCoeff: 0.32,
    frontalAreaM2: 2.38,
    marketSharePct: 44.2,
    araiRangeKm: 465,
    realWorldRangeKm: 310
  },
  {
    id: 'mg-zs-ev',
    name: 'MG ZS EV Excite',
    segment: '4W Passenger (Mid-Size SUV)',
    batteryKWh: 50.3,
    usableKWh: 48.0,
    baseConsumptionWhKm: 165,
    curbWeightKg: 1620,
    maxDcChargeKW: 50,
    chargeCurveType: 'stepped',
    dragCoeff: 0.30,
    frontalAreaM2: 2.45,
    marketSharePct: 18.5,
    araiRangeKm: 461,
    realWorldRangeKm: 335
  },
  {
    id: 'byd-atto3',
    name: 'BYD Atto 3 Superior',
    segment: '4W Passenger (Long-Range SUV)',
    batteryKWh: 60.5,
    usableKWh: 58.0,
    baseConsumptionWhKm: 170,
    curbWeightKg: 1750,
    maxDcChargeKW: 80,
    chargeCurveType: 'blade-lfp',
    dragCoeff: 0.29,
    frontalAreaM2: 2.52,
    marketSharePct: 9.8,
    araiRangeKm: 521,
    realWorldRangeKm: 390
  },
  {
    id: 'xuv400',
    name: 'Mahindra XUV400 EL Pro',
    segment: '4W Passenger (SUV)',
    batteryKWh: 39.4,
    usableKWh: 37.5,
    baseConsumptionWhKm: 155,
    curbWeightKg: 1580,
    maxDcChargeKW: 50,
    chargeCurveType: 'stepped',
    dragCoeff: 0.33,
    frontalAreaM2: 2.40,
    marketSharePct: 12.1,
    araiRangeKm: 375,
    realWorldRangeKm: 280
  },
  {
    id: 'commercial-bus',
    name: 'Olectra / PMI 12m Intercity E-Coach',
    segment: 'Commercial Heavy Passenger (Bus)',
    batteryKWh: 250.0,
    usableKWh: 235.0,
    baseConsumptionWhKm: 900,
    curbWeightKg: 13500,
    maxDcChargeKW: 150,
    chargeCurveType: 'dual-gun-ccs2',
    dragCoeff: 0.65,
    frontalAreaM2: 7.20,
    marketSharePct: 15.4,
    araiRangeKm: 300,
    realWorldRangeKm: 240
  }
];

// -----------------------------------------------------------------------------
// CORRIDOR TOPOGRAPHICAL & INTERCHANGE PROFILES
// -----------------------------------------------------------------------------
export const CORRIDOR_PROFILES = [
  {
    id: 'samruddhi',
    name: 'Hindu Hrudaysamrat Balasaheb Thackeray Samruddhi Mahamarg',
    statutoryLengthKm: 701.0,
    operationalLengthKm: 644.3,
    speedLimitKmh: 120,
    origin: 'Nagpur (MIHAN / Wardha Rd)',
    destination: 'Mumbai (Amane / Thane Border)',
    summary: 'Direct Greenfield expressway spanning 10 districts. Features zero mainline charging stations, necessitating off-corridor interchange detours.',
    interchanges: [
      { km: 0, name: 'Nagpur MIHAN Interchange', elevationM: 310, district: 'Nagpur', hasNearbyCharger: true, chargerDistKm: 1.2, powerKW: 120 },
      { km: 38, name: 'Seloo Interchange', elevationM: 234, district: 'Wardha', hasNearbyCharger: false, chargerDistKm: 8.5, powerKW: 50 },
      { km: 89, name: 'Dhamangaon Railway Interchange', elevationM: 320, district: 'Amravati', hasNearbyCharger: false, chargerDistKm: 12.0, powerKW: 30 },
      { km: 145, name: 'Karanja Lad Interchange', elevationM: 546, district: 'Washim', hasNearbyCharger: true, chargerDistKm: 2.8, powerKW: 60 },
      { km: 218, name: 'Mehkar Interchange', elevationM: 630, district: 'Buldhana', hasNearbyCharger: false, chargerDistKm: 6.5, powerKW: 50 },
      { km: 274, name: 'Sindkhed Raja Interchange', elevationM: 585, district: 'Buldhana', hasNearbyCharger: true, chargerDistKm: 3.1, powerKW: 60 },
      { km: 328, name: 'Jalna (Ambad) Interchange', elevationM: 508, district: 'Jalna', hasNearbyCharger: true, chargerDistKm: 2.4, powerKW: 60 },
      { km: 368, name: 'Chh. Sambhajinagar (Shendra) Interchange', elevationM: 568, district: 'Chh. Sambhajinagar', hasNearbyCharger: true, chargerDistKm: 1.8, powerKW: 120 },
      { km: 412, name: 'Vaijapur Interchange', elevationM: 470, district: 'Chh. Sambhajinagar', hasNearbyCharger: false, chargerDistKm: 9.0, powerKW: 30 },
      { km: 478, name: 'Kopargaon / Shirdi Interchange', elevationM: 495, district: 'Ahmednagar', hasNearbyCharger: true, chargerDistKm: 3.5, powerKW: 120 },
      { km: 538, name: 'Sinnar (MIDC) Interchange', elevationM: 652, district: 'Nashik', hasNearbyCharger: true, chargerDistKm: 2.2, powerKW: 120 },
      { km: 602, name: 'Igatpuri (Thal Ghat Gateway) Interchange', elevationM: 600, district: 'Nashik', hasNearbyCharger: true, chargerDistKm: 4.0, powerKW: 60 },
      { km: 644, name: 'Bharvir Operational Terminus', elevationM: 280, district: 'Nashik/Thane Border', hasNearbyCharger: true, chargerDistKm: 3.0, powerKW: 60 },
      { km: 701, name: 'Amane (Mumbai Metropolitan Gateway)', elevationM: 18, district: 'Thane', hasNearbyCharger: true, chargerDistKm: 1.5, powerKW: 180 }
    ]
  },
  {
    id: 'mumbai-pune',
    name: 'Yashwantrao Chavan Mumbai–Pune Expressway',
    statutoryLengthKm: 94.5,
    operationalLengthKm: 94.5,
    speedLimitKmh: 100,
    origin: 'Kalamboli (Navi Mumbai)',
    destination: 'Kiwale (Pune Agglomeration)',
    summary: 'India\'s first 6-lane access-controlled expressway. Features steep Western Ghats (Bhor Ghat) elevation gain from 12m to 625m, heavily testing regenerative braking and battery thermal headroom.',
    interchanges: [
      { km: 0, name: 'Kalamboli Toll Plaza', elevationM: 12, district: 'Raigad', hasNearbyCharger: true, chargerDistKm: 0.5, powerKW: 120 },
      { km: 28, name: 'Chowk Interchange (Matheran Link)', elevationM: 60, district: 'Raigad', hasNearbyCharger: true, chargerDistKm: 1.5, powerKW: 60 },
      { km: 42, name: 'Khalapur Toll Plaza (Ghat Base)', elevationM: 95, district: 'Raigad', hasNearbyCharger: true, chargerDistKm: 0.8, powerKW: 120 },
      { km: 52, name: 'Bhor Ghat Summit / Amrutanjan Point', elevationM: 580, district: 'Pune', hasNearbyCharger: false, chargerDistKm: 7.0, powerKW: 30 },
      { km: 65, name: 'Lonavala / Khandala Interchange', elevationM: 625, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 1.0, powerKW: 120 },
      { km: 82, name: 'Somatne Interchange (Talegaon MIDC)', elevationM: 590, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 2.0, powerKW: 60 },
      { km: 94.5, name: 'Kiwale / Hinjawadi Gateway', elevationM: 560, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 0.5, powerKW: 180 }
    ]
  },
  {
    id: 'pune-nashik',
    name: 'Pune–Nashik National Highway Corridor (NH-60)',
    statutoryLengthKm: 205.0,
    operationalLengthKm: 205.0,
    speedLimitKmh: 80,
    origin: 'Bhosari (Pune North)',
    destination: 'Dwarka Circle (Nashik City)',
    summary: 'Key industrial freight corridor linking Pune auto hub with Nashik agricultural cluster, crossing multiple semi-urban bottlenecks and Ghat stretches.',
    interchanges: [
      { km: 0, name: 'Bhosari MIDC (Pune)', elevationM: 560, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 0.5, powerKW: 120 },
      { km: 35, name: 'Chakan Auto Cluster', elevationM: 640, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 1.0, powerKW: 60 },
      { km: 68, name: 'Manchar By-Pass', elevationM: 680, district: 'Pune', hasNearbyCharger: false, chargerDistKm: 5.0, powerKW: 30 },
      { km: 102, name: 'Narayangaon Intersection', elevationM: 650, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 2.5, powerKW: 50 },
      { km: 138, name: 'Alephata Junction (Malshej Link)', elevationM: 670, district: 'Pune', hasNearbyCharger: true, chargerDistKm: 1.2, powerKW: 60 },
      { km: 174, name: 'Sangamner Bypass', elevationM: 545, district: 'Ahmednagar', hasNearbyCharger: true, chargerDistKm: 2.0, powerKW: 60 },
      { km: 205, name: 'Dwarka Circle (Nashik)', elevationM: 600, district: 'Nashik', hasNearbyCharger: true, chargerDistKm: 0.8, powerKW: 120 }
    ]
  }
];

// -----------------------------------------------------------------------------
// CORE PHYSICS SIMULATION ENGINE
// -----------------------------------------------------------------------------

/**
 * Simulates an EV trip along an expressway corridor with topographical elevations.
 * 
 * @param {Object} params
 * @param {string} params.corridorId - 'samruddhi' | 'mumbai-pune' | 'pune-nashik'
 * @param {string} params.vehicleId - ID from VEHICLE_MODELS
 * @param {number} params.startSocPct - Starting SoC % (10 to 100)
 * @param {number} params.ambientTempC - Ambient temperature in Celsius (15 to 45)
 * @param {string} params.hvacMode - 'off' | 'eco' | 'normal' | 'max_cool'
 * @param {number} params.cruiseSpeedKmh - Average cruising speed in km/h
 * @param {number} params.targetChargeSocPct - Charging stop target SoC % (usually 80)
 * @param {number} params.reserveSocThresholdPct - Minimum safety reserve SoC % (default 20)
 * @returns {Object} Simulation results including trajectory, charging events, and metrics
 */
export function simulateTripEnergy({
  corridorId = 'samruddhi',
  vehicleId = 'nexon-ev',
  startSocPct = 100,
  ambientTempC = 35,
  hvacMode = 'normal',
  cruiseSpeedKmh = 100,
  targetChargeSocPct = 80,
  reserveSocThresholdPct = 20
}) {
  const corridor = CORRIDOR_PROFILES.find(c => c.id === corridorId) || CORRIDOR_PROFILES[0];
  const vehicle = VEHICLE_MODELS.find(v => v.id === vehicleId) || VEHICLE_MODELS[0];

  // 1. Ambient Temperature Derating Factor (HVAC + Battery Cooling)
  // Base at 25°C. For every °C above 25°C, consumption rises by 0.7%.
  // For every °C below 18°C, chemical resistance increases consumption by 0.5%.
  let tempFactor = 1.0;
  if (ambientTempC > 25) {
    const delta = ambientTempC - 25;
    tempFactor += delta * 0.007;
  } else if (ambientTempC < 18) {
    const delta = 18 - ambientTempC;
    tempFactor += delta * 0.005;
  }

  // HVAC Mode multiplier
  const hvacMultipliers = {
    off: 0.95,
    eco: 1.00,
    normal: 1.08,
    max_cool: 1.18
  };
  const hvacFactor = hvacMultipliers[hvacMode] || 1.08;

  // Cruising Speed Aerodynamic Drag Penalty
  // Aerodynamic power increases with cube of velocity. Reference at 80 km/h = 1.0.
  const speedRef = 80;
  const aeroRatio = (cruiseSpeedKmh / speedRef);
  const speedDragFactor = 0.6 + 0.4 * Math.pow(aeroRatio, 1.8);

  // Net dynamic specific consumption (Wh/km on flat grade)
  const dynamicSpecificConsumptionWhKm = 
    vehicle.baseConsumptionWhKm * tempFactor * hvacFactor * speedDragFactor;

  // 2. Trajectory Step Simulation
  const interchanges = corridor.interchanges;
  const totalLengthKm = corridor.operationalLengthKm;
  const stepKm = 5.0; // 5 km simulation mesh resolution
  const steps = Math.ceil(totalLengthKm / stepKm);

  let currentKWh = (startSocPct / 100) * vehicle.usableKWh;
  let totalEnergyConsumedKWh = 0;
  let totalRegenRecoveredKWh = 0;
  let totalDetourPenaltyMinutes = 0;
  let totalChargingDwellMinutes = 0;

  const trajectory = [];
  const chargingStops = [];
  let isBatteryDepleted = false;
  let depletionKm = null;

  // Helper to interpolate elevation at any km
  const getElevationAtKm = (km) => {
    if (km <= 0) return interchanges[0].elevationM;
    if (km >= totalLengthKm) return interchanges[interchanges.length - 1].elevationM;
    for (let i = 0; i < interchanges.length - 1; i++) {
      const p1 = interchanges[i];
      const p2 = interchanges[i + 1];
      if (km >= p1.km && km <= p2.km) {
        const t = (km - p1.km) / (p2.km - p1.km);
        return p1.elevationM + t * (p2.elevationM - p1.elevationM);
      }
    }
    return interchanges[0].elevationM;
  };

  let prevElev = getElevationAtKm(0);

  // Initial step at km = 0
  trajectory.push({
    km: 0,
    socPct: Math.round(startSocPct * 10) / 10,
    batteryKWh: Math.round(currentKWh * 10) / 10,
    elevationM: prevElev,
    consumedKWhSoFar: 0,
    isStop: false,
    label: interchanges[0].name
  });

  for (let i = 1; i <= steps; i++) {
    const currentKm = Math.min(i * stepKm, totalLengthKm);
    const segmentKm = currentKm - (i - 1) * stepKm;
    const currentElev = getElevationAtKm(currentKm);
    const deltaElevM = currentElev - prevElev;

    // Rolling + Aero flat energy for segment (kWh)
    const flatEnergyKWh = (dynamicSpecificConsumptionWhKm * segmentKm) / 1000.0;

    // Gravitational Potential Energy: deltaE = m * g * dh
    // g = 9.81 m/s^2, 1 J = 1/3,600,000 kWh = 2.777e-7 kWh
    const massKg = vehicle.curbWeightKg + 150; // vehicle + 2 passengers/cargo
    let gradeEnergyKWh = 0;
    if (deltaElevM > 0) {
      // Uphill ascent: electrical efficiency ~ 88%
      gradeEnergyKWh = (massKg * 9.81 * deltaElevM * 2.777e-7) / 0.88;
    } else if (deltaElevM < 0) {
      // Downhill descent: regenerative braking recovery ~ 65%
      const rawRecovery = (massKg * 9.81 * Math.abs(deltaElevM) * 2.777e-7) * 0.65;
      gradeEnergyKWh = -rawRecovery;
      totalRegenRecoveredKWh += rawRecovery;
    }

    const netSegmentKWh = flatEnergyKWh + gradeEnergyKWh;
    currentKWh -= netSegmentKWh;
    totalEnergyConsumedKWh += netSegmentKWh;

    let currentSoc = (currentKWh / vehicle.usableKWh) * 100;

    // Check if battery is depleted (0% or below)
    if (currentKWh <= 0 && !isBatteryDepleted) {
      isBatteryDepleted = true;
      depletionKm = Math.round(currentKm * 10) / 10;
      currentKWh = 0;
      currentSoc = 0;
    }

    // Check for nearest interchange charging opportunities if SoC hits reserve threshold (< 20%)
    if (currentSoc <= reserveSocThresholdPct && !isBatteryDepleted) {
      // Find nearest accessible interchange with a nearby charger
      const nearbyCandidate = interchanges
        .filter(ic => ic.hasNearbyCharger && ic.km >= currentKm - 15 && ic.km <= currentKm + 25)
        .sort((a, b) => Math.abs(a.km - currentKm) - Math.abs(b.km - currentKm))[0];

      if (nearbyCandidate && !chargingStops.some(s => s.interchangeName === nearbyCandidate.name)) {
        // Schedule Charging Event
        const neededKWh = (targetChargeSocPct / 100) * vehicle.usableKWh - currentKWh;
        const effectiveChargeKW = Math.min(vehicle.maxDcChargeKW, nearbyCandidate.powerKW);
        
        // Practical taper charging duration: 10% to 80% takes ~1.15x average power
        const chargeDurationHours = (neededKWh / (effectiveChargeKW * 0.90));
        const chargeDurationMinutes = Math.round(chargeDurationHours * 60);

        // Standard Samruddhi off-corridor detour penalty: 18 minutes
        const detourMinutes = 18;

        totalDetourPenaltyMinutes += detourMinutes;
        totalChargingDwellMinutes += chargeDurationMinutes;

        // Top up battery to target SoC
        currentKWh = (targetChargeSocPct / 100) * vehicle.usableKWh;
        currentSoc = targetChargeSocPct;

        chargingStops.push({
          km: nearbyCandidate.km,
          interchangeName: nearbyCandidate.name,
          district: nearbyCandidate.district,
          chargerPowerKW: nearbyCandidate.powerKW,
          offCorridorDistKm: nearbyCandidate.chargerDistKm,
          arrivingSocPct: Math.round(currentSoc * 10) / 10,
          departingSocPct: targetChargeSocPct,
          energyAddedKWh: Math.round(neededKWh * 10) / 10,
          chargeDurationMinutes,
          detourPenaltyMinutes: detourMinutes,
          totalStopDurationMinutes: chargeDurationMinutes + detourMinutes
        });
      }
    }

    // Find if currentKm matches an interchange closely
    const matchedIc = interchanges.find(ic => Math.abs(ic.km - currentKm) < stepKm / 2);

    trajectory.push({
      km: Math.round(currentKm * 10) / 10,
      socPct: Math.max(0, Math.round(currentSoc * 10) / 10),
      batteryKWh: Math.max(0, Math.round(currentKWh * 10) / 10),
      elevationM: Math.round(currentElev),
      consumedKWhSoFar: Math.round(totalEnergyConsumedKWh * 10) / 10,
      isStop: matchedIc ? chargingStops.some(s => s.km === matchedIc.km) : false,
      label: matchedIc ? matchedIc.name : null
    });

    prevElev = currentElev;
    if (currentKm >= totalLengthKm) break;
  }

  // 3. Trip Summary Statistics
  const drivingTimeMinutes = Math.round((totalLengthKm / cruiseSpeedKmh) * 60);
  const totalTripTimeMinutes = drivingTimeMinutes + totalDetourPenaltyMinutes + totalChargingDwellMinutes;

  return {
    corridor: {
      id: corridor.id,
      name: corridor.name,
      lengthKm: totalLengthKm,
      origin: corridor.origin,
      destination: corridor.destination
    },
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      batteryKWh: vehicle.batteryKWh,
      usableKWh: vehicle.usableKWh,
      baseConsumptionWhKm: vehicle.baseConsumptionWhKm,
      maxDcChargeKW: vehicle.maxDcChargeKW
    },
    conditions: {
      ambientTempC,
      hvacMode,
      cruiseSpeedKmh,
      effectiveSpecificWhKm: Math.round(dynamicSpecificConsumptionWhKm * 10) / 10,
      startSocPct,
      targetChargeSocPct,
      reserveSocThresholdPct
    },
    results: {
      trajectory,
      chargingStops,
      requiredStopsCount: chargingStops.length,
      totalEnergyConsumedKWh: Math.round(totalEnergyConsumedKWh * 10) / 10,
      totalRegenRecoveredKWh: Math.round(totalRegenRecoveredKWh * 10) / 10,
      drivingTimeMinutes,
      detourPenaltyMinutes: totalDetourPenaltyMinutes,
      chargingDwellMinutes: totalChargingDwellMinutes,
      totalTripTimeMinutes,
      finalSocPct: trajectory[trajectory.length - 1].socPct,
      isFeasibleWithoutStranding: !isBatteryDepleted,
      depletionKm,
      moPComplianceNotes: corridor.id === 'samruddhi' 
        ? 'Current baseline exhibits zero mainline operational DC fast chargers. All charging events require exiting toll plazas, incurring an 18-minute toll detour penalty.'
        : 'Meets basic expressway access but requires reinforcement for commercial high-power (>120kW) hubs.'
    }
  };
}

export default simulateTripEnergy;

