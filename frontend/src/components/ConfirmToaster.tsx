import { toast } from "sonner";

export const confirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  toast(
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
     
      <div className="px-6 py-4" style={{ backgroundColor: "#006039" }}>
        <h3 className="text-white font-semibold text-lg tracking-wide">
          Confirm Action
        </h3>
      </div>

      <div className="p-6">
        <p
          className="text-gray-800 text-base leading-relaxed mb-6"
          dangerouslySetInnerHTML={{ __html: message }}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              toast.dismiss();
              onCancel?.();
            }}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss();
              onConfirm();
            }}
            className="px-6 py-2 text-sm font-semibold text-white rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: "#006039" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    {
      duration: Infinity,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
      },
    }
  );
};
