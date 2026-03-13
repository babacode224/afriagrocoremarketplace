import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Label } from "@/components/ui/label";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function PhoneInputField({
  value,
  onChange,
  label = "Phone Number",
  required = false,
  placeholder = "Enter phone number",
}: PhoneInputFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-700 font-medium text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="phone-input-wrapper">
        <PhoneInput
          international
          defaultCountry="NG"
          value={value}
          onChange={(val) => onChange(val || "")}
          placeholder={placeholder}
          className="phone-input"
        />
      </div>
      <style>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          background: white;
          transition: border-color 0.15s;
        }
        .phone-input-wrapper .PhoneInput:focus-within {
          border-color: #E85D04;
          box-shadow: 0 0 0 1px #E85D04;
        }
        .phone-input-wrapper .PhoneInputCountry {
          padding: 0 0.75rem;
          border-right: 1px solid #e5e7eb;
          background: #f9fafb;
          height: 38px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .phone-input-wrapper .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          font-size: 0.875rem;
          cursor: pointer;
          outline: none;
          max-width: 28px;
        }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
