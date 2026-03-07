import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LocationAutocomplete, { type LocationResult } from "./LocationAutocomplete";
import RouteMap, { type RouteInfo } from "./RouteMap";
import RouteInfoDisplay from "./RouteInfo";

const journeyTypes = [
  "Wedding",
  "Airport Transfer",
  "Corporate",
  "School Trip",
  "Night Out",
  "Other"
];

const passengerRanges = ["1–4", "5–8", "9–12", "13–16", "Not sure yet"];

const pickupTimeRanges = [
  "Early Morning (05:00 – 08:00)",
  "Morning (08:00 – 12:00)",
  "Afternoon (12:00 – 17:00)",
  "Evening (17:00 – 21:00)",
  "Late Night (21:00 – 00:00)",
  "Overnight (00:00 – 05:00)"
];

const EnquiryForm = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [returnJourney, setReturnJourney] = useState(false);

  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    journeyType: "",
    date: "",
    time: "",
    passengers: "",
    returnTime: "",
    notes: ""
  });

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        ...formData,
        returnJourney,
        returnTime: returnJourney ? formData.returnTime : null,
        pickupAddress: pickupLocation?.displayName || null,
        pickupCoords: pickupLocation
          ? { lat: pickupLocation.lat, lon: pickupLocation.lon }
          : null,
        dropoffAddress: dropoffLocation?.displayName || null,
        dropoffCoords: dropoffLocation
          ? { lat: dropoffLocation.lat, lon: dropoffLocation.lon }
          : null,
        distanceMiles: routeInfo?.distanceMiles || null,
        durationMinutes: routeInfo?.durationMinutes || null
      };

      const { data, error } = await supabase.functions.invoke("send-enquiry", {
        body: payload
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to send");

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Journey", "Locations", "Date & Time", "Extras", "About You"];

  if (submitted) {
    return (
      <section id="enquiry" className="py-20 lg:py-28 bg-stone-300">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-xl bg-navy-light/40 border border-navy-light/30 p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary-foreground">
              Thanks! We'll be in touch within the hour.
            </h3>
            <p className="mt-3 text-primary-foreground/70">
              We've received your enquiry and will get back to you shortly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-navy-light/30 bg-navy-light/20 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50";

  const labelClass =
    "block text-sm font-medium text-primary-foreground/80 mb-1.5";

  return (
    <section id="enquiry" className="py-20 lg:py-28 bg-stone-300">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Get a Price - within the hour
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-medium text-navy-dark">
            Tell Us About Your Journey
          </h2>
          <p className="mt-3 text-navy-light">
            Don't worry if you don't have all the details yet — just give us what you can.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === i + 1
                    ? "bg-gold text-navy"
                    : step > i + 1
                    ? "bg-gold/30 text-gold"
                    : "bg-navy-light/30 text-primary-foreground/40"
                }`}
              >
                {i + 1}
              </div>
              <span className="hidden sm:inline text-xs text-navy-dark">
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className="w-6 h-px bg-navy-light/30" />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-navy-light/30 p-8 bg-gold-dark">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary-foreground">
                  Journey Details
                </h3>
              </div>

              <div>
                <label className={labelClass}>What's the occasion?</label>
                <select
                  className={inputClass}
                  value={formData.journeyType}
                  onChange={(e) => update("journeyType", e.target.value)}
                >
                  <option value="">Select a journey type</option>
                  {journeyTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>How many passengers?</label>
                <select
                  className={inputClass}
                  value={formData.passengers}
                  onChange={(e) => update("passengers", e.target.value)}
                >
                  <option value="">Select a range</option>
                  {passengerRanges.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 — FIXED LOCATION AUTOCOMPLETE */}
          {step === 2 && (
            <div className="space-y-5">

              <LocationAutocomplete
                key="pickup"
                label="Pick-up location"
                placeholder="e.g. Leeds City Centre"
                value={pickupLocation}
                onChange={setPickupLocation}
              />

              <LocationAutocomplete
                key="dropoff"
                label="Drop-off location"
                placeholder="e.g. Harrogate Town Centre"
                value={dropoffLocation}
                onChange={setDropoffLocation}
              />

              <RouteInfoDisplay routeInfo={routeInfo} />

              <RouteMap
                pickup={pickupLocation}
                dropoff={dropoffLocation}
                onRouteCalculated={setRouteInfo}
              />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">

              <div>
                <label className={labelClass}>Date of travel</label>
                <input
                  className={inputClass}
                  type="date"
                  value={formData.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Pick-up time</label>
                <select
                  className={inputClass}
                  value={formData.time}
                  onChange={(e) => update("time", e.target.value)}
                >
                  <option value="">Select a time range</option>
                  {pickupTimeRanges.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setReturnJourney(true)}
                  className={`px-6 py-2.5 rounded-lg ${
                    returnJourney ? "bg-gold text-navy" : "bg-navy-light/30"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setReturnJourney(false)}
                  className={`px-6 py-2.5 rounded-lg ${
                    !returnJourney ? "bg-gold text-navy" : "bg-navy-light/30"
                  }`}
                >
                  No
                </button>
              </div>

              {returnJourney && (
                <input
                  className={inputClass}
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => update("returnTime", e.target.value)}
                />
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <textarea
              className={`${inputClass} min-h-[120px]`}
              placeholder="Any special requirements..."
              value={formData.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <input
                className={inputClass}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />

              <input
                className={inputClass}
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <input
                className={inputClass}
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value)}
              />

              {submitError && <p className="text-red-400">{submitError}</p>}
            </div>
          )}

          {/* NAVIGATION */}
          <div className="mt-8 flex justify-between">

            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 bg-muted text-navy rounded-xl"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-muted text-navy rounded-xl"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 bg-muted text-navy rounded-xl flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending…" : "Send Enquiry"}
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default EnquiryForm;
