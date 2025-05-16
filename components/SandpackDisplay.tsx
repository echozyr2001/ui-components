"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import React from "react";

interface SandpackFiles {
  [key: string]:
    | string
    | { code: string; readOnly?: boolean; active?: boolean; hidden?: boolean };
}

interface SandpackDisplayProps {
  sandpackFiles: SandpackFiles;
  displayComponentName: string; // Used for potential options or if needed internally
}

export default function SandpackDisplay({
  sandpackFiles,
  displayComponentName,
}: SandpackDisplayProps) {
  // Ensure the active file is correctly set if not handled by `active: true` in file config
  // const activeFilePath = `/${displayComponentName}.tsx`;

  return (
    <Sandpack
      template="react-ts"
      files={sandpackFiles}
      theme="auto"
      options={{
        showNavigator: true,
        showTabs: true,
        showLineNumbers: true,
        editorHeight: "400px",
        // activeFile: activeFilePath, // This can be useful if active:true in files prop isn't sufficient
      }}
    />
  );
}
