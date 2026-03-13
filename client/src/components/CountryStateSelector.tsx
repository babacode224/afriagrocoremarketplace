import { useState, useEffect } from "react";
import { Country, State } from "country-state-city";
import { Label } from "@/components/ui/label";

interface CountryStateSelectorProps {
  countryValue: string;
  stateValue: string;
  onCountryChange: (countryCode: string, countryName: string) => void;
  onStateChange: (stateCode: string, stateName: string) => void;
  countryLabel?: string;
  stateLabel?: string;
  required?: boolean;
  className?: string;
}

export function CountryStateSelector({
  countryValue,
  stateValue,
  onCountryChange,
  onStateChange,
  countryLabel = "Country",
  stateLabel = "State / Province",
  required = false,
  className = "",
}: CountryStateSelectorProps) {
  const [states, setStates] = useState<{ isoCode: string; name: string }[]>([]);
  const allCountries = Country.getAllCountries();

  useEffect(() => {
    if (countryValue) {
      const countryStates = State.getStatesOfCountry(countryValue);
      setStates(countryStates);
      // Reset state if country changes and current state is not in new list
      if (stateValue && !countryStates.find(s => s.isoCode === stateValue)) {
        onStateChange("", "");
      }
    } else {
      setStates([]);
    }
  }, [countryValue]);

  const selectClass = `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04] ${className}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label className="text-gray-700 font-medium text-sm">
          {countryLabel} {required && <span className="text-red-500">*</span>}
        </Label>
        <select
          className={selectClass}
          value={countryValue}
          onChange={(e) => {
            const selected = allCountries.find(c => c.isoCode === e.target.value);
            onCountryChange(e.target.value, selected?.name || "");
          }}
          required={required}
        >
          <option value="">Select Country</option>
          {allCountries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-gray-700 font-medium text-sm">
          {stateLabel} {required && states.length > 0 && <span className="text-red-500">*</span>}
        </Label>
        <select
          className={selectClass}
          value={stateValue}
          onChange={(e) => {
            const selected = states.find(s => s.isoCode === e.target.value);
            onStateChange(e.target.value, selected?.name || "");
          }}
          disabled={!countryValue || states.length === 0}
          required={required && states.length > 0}
        >
          <option value="">
            {!countryValue
              ? "Select country first"
              : states.length === 0
              ? "No states available"
              : "Select State / Province"}
          </option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
