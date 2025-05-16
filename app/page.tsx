export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8 text-center font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your UI Component Showcase
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          This is a place to browse, test, and understand the custom UI
          components you've designed.
        </p>
        <p className="text-md">
          Please select a component from the sidebar to see its preview and
          usage details.
        </p>
      </main>
    </div>
  );
}
