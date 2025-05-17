import React from "react";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs/promises";
// import SandpackDisplay from "../../../components/SandpackDisplay"; // Adjusted path - REMOVED
import { codeToHtml } from "shiki";

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
  let ComponentToShow: React.ComponentType<any> | null = null; // RESTORED for direct preview
  let componentCodeString: string | null = null;
  let highlightedCodeHtml: string | null = null; // For shiki output

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
      return; // Ensure notFound stops execution here
    }

    // Dynamically import the component using the actual file name
    const componentModule = (await import(
      `@/components/design/${actualComponentName}`
    )) as any; // Use 'any' for more flexible access, or define a more complex type

    // Try to get the default export, then try a named export matching the component name
    if (componentModule.default) {
      ComponentToShow = componentModule.default;
    } else if (componentModule[actualComponentName]) {
      ComponentToShow = componentModule[actualComponentName];
    } else {
      // If neither default nor named export matching the name is found, log an error
      console.error(
        `No default or matching named export found for ${actualComponentName} in module:`,
        componentModule
      );
      // ComponentToShow will remain null, leading to the notFound() path
    }

    // Read the component's code
    const componentFilePath = path.join(
      process.cwd(),
      "components/design",
      `${actualComponentName}.tsx` // Assuming .tsx, adjust if .jsx is also possible and needs different handling for shiki
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

  if (!ComponentToShow || !componentCodeString) {
    // Check both ComponentToShow and code string
    console.error(
      `Component or code for "${actualComponentName}" could not be loaded.`
    );
    notFound();
    return;
  }

  // Use actualComponentName for display
  const displayComponentName = actualComponentName;

  let processedComponentCode = componentCodeString;
  // let customSetup: Record<string, any> | undefined = undefined; // REMOVED as it was for Sandpack

  // Specific modifications for Header component (and potentially others)
  // This processing is for the code that will be displayed.
  if (actualComponentName === "Header") {
    // customSetup = { // REMOVED
    //   dependencies: {
    //     "framer-motion": "latest",
    //   },
    // };
    if (processedComponentCode) {
      processedComponentCode = processedComponentCode.replace(
        /from "motion\/react";/g,
        'from "framer-motion";'
      );
      processedComponentCode = processedComponentCode.replace(
        /import Link from "next\/link";/g,
        '// import Link from "next/link"; (replaced with <a> for standalone display)'
      );
      processedComponentCode = processedComponentCode.replace(
        /<Link([^>]*?)href=(["'])([^"']*)\2([^>]*?)>/g,
        "<a$1href=$2$3$2$4>"
      );
      processedComponentCode = processedComponentCode.replace(
        /<\/Link>/g,
        "</a>"
      );
    }
  }

  // Ensure a default export for the displayed code if the original component doesn't have one
  // This makes the displayed code snippet more self-contained if copied.
  if (
    processedComponentCode &&
    !componentCodeString.includes("export default") &&
    !processedComponentCode.includes(`export default ${displayComponentName};`) // Avoid double-adding
  ) {
    processedComponentCode += `\n\n// Added for standalone display purposes:\nexport default ${displayComponentName};`;
  }

  // Highlight code with shiki
  try {
    highlightedCodeHtml = await codeToHtml(processedComponentCode, {
      lang: "tsx",
      theme: "github-dark", // You can choose other themes like 'nord', 'material-theme-palenight', etc.
      // themes: { // Or provide multiple themes for light/dark mode
      //   light: 'github-light',
      //   dark: 'github-dark',
      // },
    });
  } catch (error) {
    console.error("Failed to highlight code with shiki:", error);
    // Fallback to pre/code if shiki fails
    highlightedCodeHtml = `<pre><code>${processedComponentCode
      .replace(/</g, "<")
      .replace(/>/g, ">")}</code></pre>`;
  }

  const componentDescription = `This is a brief description for the ${displayComponentName} component. It showcases its basic functionality and usage.`;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "2em", marginBottom: "20px" }}>
        {displayComponentName}
      </h1>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Description</h2>
        <p>{componentDescription}</p>
      </section>

      <section
        style={{
          marginBottom: "30px",
          border: "1px solid #eee",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>Preview</h2>
        <ComponentToShow />
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>
          Component Code
        </h2>
        {/* Render shiki's HTML output */}
        {highlightedCodeHtml && (
          <div dangerouslySetInnerHTML={{ __html: highlightedCodeHtml }} />
        )}
      </section>
      {/* Props documentation will be added in the next phase */}
    </div>
  );
}

// Optional: Generate static paths
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
