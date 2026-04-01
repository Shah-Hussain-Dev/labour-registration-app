/**
 * Dummy JSON-only flow. Replace these functions with real fetch() calls when the API is ready.
 */
import DUMMY_LABOUR from "../data/dummyLabour.json";

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizePayload(data, fallbackId) {
  return {
    labourId: data.labourId ?? data.labour_id ?? fallbackId,
    name: data.name ?? "",
    mobile: data.mobile ?? data.phone ?? "",
    countryCode: data.countryCode ?? data.country_code ?? "+91",
    aadhaar: data.aadhaar ?? data.adhaar ?? data.aadhaarNumber ?? "",
    email: data.email ?? "",
    dob: data.dob ?? data.dateOfBirth ?? "",
    gender: String(data.gender ?? "").toLowerCase() || "",
    ayushmanCard: Boolean(data.ayushmanCard ?? data.ayushman_card),
    ayushmanCardNumber:
      data.ayushmanCardNumber ?? data.ayushman_card_number ?? data.ayushmanCardNo ?? "",
    mappedBarcode: data.mappedBarcode ?? data.barcode ?? data.mapped_barcode ?? "",
  };
}

const KNOWN_IDS = Object.keys(DUMMY_LABOUR);

export async function fetchLabourById(labourId) {
  const id = String(labourId || "").trim();
  if (!id) {
    throw new Error("Labour ID is required.");
  }

  await delay(350);
  const row = DUMMY_LABOUR[id.toUpperCase()] ?? DUMMY_LABOUR[id];
  if (!row) {
    throw new Error(
      `Labour not found. Try: ${KNOWN_IDS.slice(0, 3).join(", ")}${KNOWN_IDS.length > 3 ? "…" : ""}`,
    );
  }
  return normalizePayload({ ...row }, id);
}

export async function submitLabourRegistration(payload) {
  await delay(450);
  // Dev visibility of the full payload (remove or switch to logging service when API exists)
  console.info("[YoloHealth dummy submit]", JSON.stringify(payload, null, 2));
  return { ok: true, receivedAt: new Date().toISOString() };
}
