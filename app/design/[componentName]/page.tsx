import React from "react";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs/promises";
import SandpackDisplay from "../../../components/SandpackDisplay"; // Adjusted path

// Define a type for the component module
type ComponentModule = {
  default: React.ComponentType<any>;
};

export default async function DesignComponentPage({
  params,
}: {
  params: { componentName: string };
}) {
  // Await params as suggested by the error message.
  const resolvedParams = await params;
  const routeComponentName = resolvedParams.componentName; // e.g., "demobutton"
  let actualComponentName: string | null = null;
  // ComponentToShow is still needed for the direct preview if we keep it, or for type checking.
  // For Sandpack, we primarily need the code string.
  // let ComponentToShow: React.ComponentType<any> | null = null;
  let componentCodeString: string | null = null;

  try {
    const designDirPath = path.join(process.cwd(), "components/design");
    const files = await fs.readdir(designDirPath);

    for (const file of files) {
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        const nameWithoutExtension = file.replace(/\.(tsx|jsx)$/, "");
        if (
          nameWithoutExtension.toLowerCase() ===
          routeComponentName.toLowerCase()
        ) {
          actualComponentName = nameWithoutExtension; // Found the actual component name, e.g., "DemoButton"
          break;
        }
      }
    }

    if (!actualComponentName) {
      console.error(
        `Component file for "${routeComponentName}" not found in components/design.`
      );
      notFound();
      return; // Ensure notFound stops execution here
    }

    // Dynamically import the component using the actual file name (still useful for metadata or if we want a non-Sandpack preview too)
    // const componentModule = (await import(
    //   `@/components/design/${actualComponentName}`
    // )) as ComponentModule;
    // ComponentToShow = componentModule.default;

    // Read the component's code for Sandpack
    const componentFilePath = path.join(
      process.cwd(),
      "components/design",
      `${actualComponentName}.tsx`
    );
    componentCodeString = await fs.readFile(componentFilePath, "utf-8");
  } catch (error) {
    console.error(
      `Failed to load or read component ${
        actualComponentName || routeComponentName
      }:`,
      error
    );
    notFound(); // Triggers 404 page
    return; // Ensure notFound stops execution here
  }

  // if (!ComponentToShow) { // If we remove ComponentToShow for direct preview
  //   notFound();
  //   return;
  // }
  if (!componentCodeString) {
    // Check if code string was loaded
    console.error(
      `Component code for "${actualComponentName}" could not be read.`
    );
    notFound();
    return;
  }

  // Use actualComponentName for display and import paths
  const displayComponentName = actualComponentName; // Should be guaranteed to be non-null here

  const componentDescription = `This is a brief description for the ${displayComponentName} component. It showcases its basic functionality and usage. Interact with the code below!`;

  // Sandpack files configuration
  const sandpackFiles = {
    // Entry point for Sandpack, uses the component
    "/App.tsx": `import React from 'react';
import ${displayComponentName} from './${displayComponentName}'; // Sandpack internal path
// You might want to add a global stylesheet if your components rely on it
// import './styles.css'; 

export default function App() {
  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
      <${displayComponentName} />
    </div>
  );
}`,
    // The actual component code, making sure the filename matches the import in App.tsx
    [`/${displayComponentName}.tsx`]: {
      code: componentCodeString,
      readOnly: false, // Allow users to tinker with the component code itself
      active: true, // Make this file active by default
    },
    // Example of a global stylesheet for Sandpack, if needed
    // "/styles.css": {
    //   code: \`body { font-family: sans-serif; }\`,
    //   hidden: true,
    // },
  };

  // const usageCode = \`import ${displayComponentName} from '@/components/design/${displayComponentName}';

  // export default function MyPage() {
  //   return (
  //     <${displayComponentName} />
  //   );
  // }\`;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "2em", marginBottom: "20px" }}>
        {displayComponentName}
      </h1>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Description</h2>
        <p>{componentDescription}</p>
      </section>

      <SandpackDisplay
        sandpackFiles={sandpackFiles}
        displayComponentName={displayComponentName}
      />
      {/* 
        The old preview and usage sections are replaced by Sandpack.
        If you still want a static preview outside Sandpack, you'd need ComponentToShow.
        For now, we rely entirely on Sandpack.
      */}
    </div>
  );
}

// Optional: Generate static paths if you know all component names at build time
// This improves performance by pre-rendering these pages.
export async function generateStaticParams() {
  try {
    const designDirPath = path.join(process.cwd(), "components/design");
    const files = await fs.readdir(designDirPath);
    return files
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".jsx"))
      .map((file) => ({
        componentName: file.replace(/\.(tsx|jsx)$/, "").toLowerCase(),
      }));
  } catch (error) {
    console.error(
      "Failed to read design components directory for static params:",
      error
    );
    return [];
  }
}
