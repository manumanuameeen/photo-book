import { type ChangeEvent } from "react";

export interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    placeholder?: string;
    error?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isSelect?: boolean;
    selectOptions?: string[];
    isTextArea?: boolean;
    disabled?: boolean;
    className?: string;
}

export const FormInput = ({
    label,
    name,
    type = "text",
    value,
    placeholder,
    error,
    onChange,
    isSelect,
    selectOptions,
    isTextArea,
    disabled,
    className,
}: FormInputProps) => {

    const sharedClasses = `border rounded-lg px-3 py-2 outline-none w-full transition-all 
      ${error ? "border-red-500" : "border-gray-300 focus:border-green-600"} ${className || ""}`;

    const renderInput = () => {
        if (isSelect) {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void}
                    className={sharedClasses}
                    disabled={disabled}
                >
                    <option value="" disabled>Select an option</option>
                    {selectOptions?.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        }

        if (isTextArea) {
            return (
                <textarea
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
                    className={`${sharedClasses} h-24 resize-none`}
                    disabled={disabled}
                />
            );
        }

        return (
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
                className={sharedClasses}
                disabled={disabled}
            />
        );
    };

    return (
        <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {renderInput()}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};