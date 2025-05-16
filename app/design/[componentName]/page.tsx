import React from "react";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs/promises";

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
  // If params is not a promise, await will resolve immediately with the value.
  const resolvedParams = await params;
  const routeComponentName = resolvedParams.componentName; // e.g., "demobutton"
  let actualComponentName: string | null = null;
  let ComponentToShow: React.ComponentType<any> | null = null;

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

    // Dynamically import the component using the actual file name
    const componentModule = (await import(
      `@/components/design/${actualComponentName}`
    )) as ComponentModule;
    ComponentToShow = componentModule.default;
  } catch (error) {
    console.error(
      `Failed to load component ${actualComponentName || routeComponentName}:`,
      error
    );
    notFound(); // Triggers 404 page
    return; // Ensure notFound stops execution here
  }

  if (!ComponentToShow) {
    // This case should ideally be caught by the !actualComponentName check or import error
    notFound();
    return;
  }

  // Use actualComponentName for display and import paths if available, otherwise fallback (though less likely now)
  const displayComponentName =
    actualComponentName ||
    routeComponentName.charAt(0).toUpperCase() + routeComponentName.slice(1);

  const componentDescription = `This is a brief description for the ${displayComponentName} component. It showcases its basic functionality and usage.`;
  const usageCode = `import ${displayComponentName} from '@/components/design/${displayComponentName}';

export default function MyPage() {
  return (
    <${displayComponentName} />
  );
}`;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "2em", marginBottom: "20px" }}>
        {displayComponentName}
      </h1>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Description</h2>
        <p>{componentDescription}</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Preview</h2>
        <div
          style={{
            border: "1px solid #eee",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <ComponentToShow />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Usage</h2>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            overflowX: "auto",
          }}
        >
          <code>{usageCode}</code>
        </pre>
      </section>
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
