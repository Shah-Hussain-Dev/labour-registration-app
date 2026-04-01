import { lazy, Suspense, useState } from "react";
import { fetchLabourById, submitLabourRegistration } from "../api/labourService.js";
import PreviewModal from "./PreviewModal.jsx";

const BarcodeScanModal = lazy(() => import("./BarcodeScanModal.jsx"));

const emptyForm = () => ({
  labourId: "",
  name: "",
  countryCode: "+91",
  mobile: "",
  aadhaar: "",
  email: "",
  dob: "",
  gender: "",
  ayushmanCard: false,
  ayushmanCardNumber: "",
  mappedBarcode: "",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLabourForm(f) {
  const err = {};
  if (!String(f.labourId || "").trim()) err.labourId = "Labour ID is required";
  if (!String(f.name || "").trim()) err.name = "Name is required";
  const aadhaar = String(f.aadhaar || "").trim();
  if (!aadhaar) err.aadhaar = "Aadhaar is required";
  else if (!/^\d{12}$/.test(aadhaar)) err.aadhaar = "Enter 12 digits";
  const email = String(f.email || "").trim();
  if (email && !EMAIL_RE.test(email)) err.email = "Enter a valid email";
  if (!String(f.dob || "").trim()) err.dob = "Date of birth is required";
  if (!String(f.gender || "").trim()) err.gender = "Select gender";
  if (f.ayushmanCard && !String(f.ayushmanCardNumber || "").trim()) {
    err.ayushmanCardNumber = "Ayushman card number is required";
  }
  return err;
}

export default function LabourRegistrationForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadingLabour, setLoadingLabour] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState(null);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [barcodeScanOpen, setBarcodeScanOpen] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function onLoadLabour() {
    setLoadError("");
    setSuccessMsg("");
    setSubmitError("");
    const id = String(form.labourId || "").trim();
    if (!id) {
      setLoadError("Enter a Labour ID first.");
      return;
    }
    setLoadingLabour(true);
    try {
      const data = await fetchLabourById(id);
      setForm({
        ...emptyForm(),
        ...data,
        labourId: data.labourId || id,
      });
      setErrors({});
      setLoaded(true);
    } catch (e) {
      setLoaded(false);
      setLoadError(e.message || "Something went wrong.");
    } finally {
      setLoadingLabour(false);
    }
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (!loaded) return;
    const nextErrors = validateLabourForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      const el = document.getElementById(
        firstKey === "labourId"
          ? "labourId"
          : firstKey === "ayushmanCardNumber"
            ? "ayushmanCardNumber"
            : firstKey,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return;
    }
    setPreviewValues({ ...form });
    setPreviewOpen(true);
  }

  async function onConfirmRegister() {
    if (!previewValues) return;
    setFinalSubmitting(true);
    setSuccessMsg("");
    setSubmitError("");
    try {
      await submitLabourRegistration({
        labourId: previewValues.labourId,
        name: previewValues.name,
        countryCode: previewValues.countryCode,
        mobile: previewValues.mobile,
        aadhaar: previewValues.aadhaar,
        email: previewValues.email,
        dob: previewValues.dob,
        gender: previewValues.gender,
        ayushmanCard: previewValues.ayushmanCard,
        ayushmanCardNumber: previewValues.ayushmanCard
          ? String(previewValues.ayushmanCardNumber || "").trim()
          : "",
        mappedBarcode: previewValues.mappedBarcode,
      });
      setPreviewOpen(false);
      setPreviewValues(null);
      setSuccessMsg("Registration submitted successfully.");
      setLoaded(false);
      setForm(emptyForm());
      setErrors({});
    } catch (e) {
      setSubmitError(e.message || "Submission failed.");
    } finally {
      setFinalSubmitting(false);
    }
  }

  const labourIdTrimmed = String(form.labourId || "").trim();

  return (
    <>
      <form id="yh-labour-form" className="form-card" noValidate onSubmit={onFormSubmit}>
        <h1 className="form-card__title">
          {loaded && labourIdTrimmed
            ? `Register: ${labourIdTrimmed}`
            : "Labour registration"}
        </h1>

        {successMsg ? (
          <p className="banner banner--success" role="status">
            {successMsg}
          </p>
        ) : null}
        {submitError ? (
          <p className="banner banner--error" role="alert">
            {submitError}
          </p>
        ) : null}

        <section className="labour-id-block" aria-label="Labour lookup">
          <label className="field-label" htmlFor="labourId">
            Labour ID <span className="req">*</span>
          </label>
          <div className="labour-id-row">
            <input
              id="labourId"
              type="text"
              className="input"
              autoComplete="off"
              disabled={loadingLabour}
              value={form.labourId}
              onChange={(e) => updateField("labourId", e.target.value)}
              aria-invalid={errors.labourId ? "true" : "false"}
              aria-describedby={loadError ? "load-err" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onLoadLabour();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onLoadLabour}
              disabled={loadingLabour}
            >
              {loadingLabour ? (
                <span className="inline-spinner" aria-hidden />
              ) : null}
              {loadingLabour ? "Loading…" : "Load details"}
            </button>
          </div>
          {errors.labourId ? <p className="field-error">{errors.labourId}</p> : null}
          {loadError ? (
            <p id="load-err" className="field-error" role="alert">
              {loadError}
            </p>
          ) : null}
          <p className="field-hint">
            Dummy data: try Labour IDs <strong>UKHA001</strong>, <strong>DEMO002</strong>, <strong>YH003</strong>, or{" "}
            <strong>YH004</strong>. Real API can replace this later.
          </p>
        </section>

        {loaded ? (
          <>
            <div className="labour-form">
              <div className="form-grid">
                <div className="field">
                  <label className="field-label" htmlFor="name">
                    Name <span className="req">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name ? <p className="field-error">{errors.name}</p> : null}
                </div>

                <div className="field">
                  <span className="field-label" id="mobile-label">
                    Mobile
                  </span>
                  <div className="mobile-row" role="group" aria-labelledby="mobile-label">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input input--code"
                      aria-label="Country code"
                      value={form.countryCode}
                      onChange={(e) => updateField("countryCode", e.target.value)}
                    />
                    <input
                      id="mobile"
                      type="tel"
                      className="input input--grow"
                      autoComplete="tel"
                      inputMode="numeric"
                      value={form.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="aadhaar">
                    Aadhaar number <span className="req">*</span>
                  </label>
                  <input
                    id="aadhaar"
                    type="text"
                    inputMode="numeric"
                    className="input"
                    autoComplete="off"
                    maxLength={12}
                    value={form.aadhaar}
                    onChange={(e) => updateField("aadhaar", e.target.value)}
                    aria-invalid={errors.aadhaar ? "true" : "false"}
                  />
                  {errors.aadhaar ? <p className="field-error">{errors.aadhaar}</p> : null}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email ? <p className="field-error">{errors.email}</p> : null}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="dob">
                    Date of birth <span className="req">*</span>
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className="input"
                    value={form.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    aria-invalid={errors.dob ? "true" : "false"}
                  />
                  {errors.dob ? <p className="field-error">{errors.dob}</p> : null}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="gender">
                    Gender <span className="req">*</span>
                  </label>
                  <select
                    id="gender"
                    className="input input--select"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    aria-invalid={errors.gender ? "true" : "false"}
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                  {errors.gender ? <p className="field-error">{errors.gender}</p> : null}
                </div>

                <div className="field field--full span-barcode">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.ayushmanCard}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          ayushmanCard: checked,
                          ayushmanCardNumber: checked ? prev.ayushmanCardNumber : "",
                        }));
                        if (errors.ayushmanCardNumber) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.ayushmanCardNumber;
                            return next;
                          });
                        }
                      }}
                    />
                    <span>Does the patient have an Ayushman card?</span>
                  </label>
                </div>

                {form.ayushmanCard ? (
                  <div className="field field--full span-barcode">
                    <label className="field-label" htmlFor="ayushmanCardNumber">
                      Ayushman card number <span className="req">*</span>
                    </label>
                    <input
                      id="ayushmanCardNumber"
                      type="text"
                      className="input"
                      autoComplete="off"
                      placeholder="Enter Ayushman card number"
                      value={form.ayushmanCardNumber}
                      onChange={(e) => updateField("ayushmanCardNumber", e.target.value)}
                      aria-invalid={errors.ayushmanCardNumber ? "true" : "false"}
                      aria-required="true"
                    />
                    {errors.ayushmanCardNumber ? (
                      <p className="field-error">{errors.ayushmanCardNumber}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="field span-barcode">
                  <label className="field-label" htmlFor="mappedBarcode">
                    EAN-13 barcode
                  </label>
                  <p className="field-hint field-hint--tight">
                    USB / Bluetooth scanners: tap here, then scan (the digits appear like typing). Or use the camera
                    scanner. 13 digits for EAN-13.
                  </p>
                  <input
                    id="mappedBarcode"
                    type="text"
                    className="input"
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="13-digit EAN-13"
                    enterKeyHint="done"
                    value={form.mappedBarcode}
                    onChange={(e) => updateField("mappedBarcode", e.target.value.replace(/\D/g, "").slice(0, 13))}
                  />
                  <div className="barcode-actions">
                    <button type="button" className="btn btn-scan" onClick={() => setBarcodeScanOpen(true)}>
                      Scan with camera (EAN-13)
                    </button>
                    <button
                      type="button"
                      className="btn btn-text"
                      onClick={() => updateField("mappedBarcode", "4006381333931")}
                    >
                      Use sample EAN-13 (dummy)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="btn btn-primary btn-submit-main">
                Review & submit
              </button>
            </div>
          </>
        ) : null}
      </form>

      {barcodeScanOpen ? (
        <Suspense fallback={null}>
          <BarcodeScanModal
            open
            onClose={() => setBarcodeScanOpen(false)}
            onDetected={(code) => {
              const digits = String(code).replace(/\D/g, "").slice(0, 13);
              updateField("mappedBarcode", digits);
              setBarcodeScanOpen(false);
            }}
          />
        </Suspense>
      ) : null}

      <PreviewModal
        open={previewOpen}
        values={previewValues}
        onBack={() => setPreviewOpen(false)}
        onConfirm={onConfirmRegister}
        submitting={finalSubmitting}
      />
    </>
  );
}
