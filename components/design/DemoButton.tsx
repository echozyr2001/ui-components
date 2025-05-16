import React from "react";

interface DemoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const DemoButton: React.FC<DemoButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      {children || "Demo Button"}
    </button>
  );
};

export default DemoButton;
