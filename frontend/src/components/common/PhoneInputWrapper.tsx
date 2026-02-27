import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./PhoneInputWrapper.css";

interface PhoneInputWrapperProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
}

const PhoneInputWrapper = ({
    value,
    onChange,
    error,
    label = "Phone Number",
}: PhoneInputWrapperProps) => {
    return (
        <div className="phone-input-container w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">{label}</label>}
            <PhoneInput
                country={"in"}
                value={value}
                onChange={onChange}
                enableSearch={true}
                containerClass="phone-input-wrapper"
                inputClass={`!w-full !h-12 !bg-gray-50 !border !rounded-xl !text-gray-900 !font-sans !text-base focus:!ring-2 focus:!ring-green-500/20 focus:!border-green-500/50 transition-all ${error ? "!border-red-500" : "!border-gray-200"
                    }`}
                buttonClass="!bg-gray-50 !border-gray-200 !rounded-l-xl hover:!bg-gray-100 transition-colors"
                dropdownClass="!bg-white !text-gray-900 !border-gray-200 !rounded-xl !shadow-2xl"
                searchClass="!bg-gray-50 !text-gray-900 !border-gray-200"
                placeholder="(555) 123-4567"
            />
            {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
        </div>
    );
};

export default PhoneInputWrapper;
