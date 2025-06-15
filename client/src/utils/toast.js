"use client";

import { FiX } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover

      // ✅ Type-based custom class
      toastClassName={({ type }) => {
        let bg = "";
        let border = "";
        let text = "text-neutral-800"; // ✅ টেক্সট কালার
      
        switch (type) {
          case "success":
            bg = "bg-green-100";
            border = "border-l-4 border-green-600";
            break;
          case "error":
            bg = "bg-red-100";
            border = "border-l-4 border-red-600";
            break;
          case "warning":
            bg = "bg-yellow-100";
            border = "border-l-4 border-yellow-600";
            break;
          case "info":
            bg = "bg-blue-100";
            border = "border-l-4 border-blue-600";
            break;
          default:
            bg = "bg-white";
            border = "border-l-4 border-gray-300";
        }
      
        return `my-3 shadow-md ${bg} ${border} ${text} p-4 flex items-center relative`;
      }}
      

      // ✅ Minimal shared inline styles (text color etc.)
      toastStyle={{
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "10px",
        paddingRight: "40px",
        fontSize: "14px",
        fontWeight: "500",
      }}

      // 📊 Progress bar styling
      progressStyle={{
        background: "#8a0303",
        position: "absolute",
        bottom: "0",
        left: "0",
        height: "3px",
      }}

      // ❌ Close button
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="text-neutral-500 hover:text-neutral-900 transition-colors absolute top-1 right-1"
          style={{
            background: "transparent",
            border: "none",
            padding: "4px",
          }}
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    />
  );
};

export default Toast;
