import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Package,
  LucideIcon,
} from "lucide-react";
import fs from "fs/promises";
import path from "path";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

interface DesignComponentItem {
  title: string;
  url: string;
  icon: LucideIcon; // Or the specific type for lucide icons if available
}

export async function AppSidebar() {
  let designComponents: DesignComponentItem[] = [];
  try {
    const designDirPath = path.join(process.cwd(), "components/design");
    const files = await fs.readdir(designDirPath);
    designComponents = files
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".jsx"))
      .map((file) => {
        const componentName = file.replace(/\.(tsx|jsx)$/, "");
        return {
          title: componentName,
          url: `/design/${componentName.toLowerCase()}`, // Assuming lowercase routes
          icon: Package, // Using a generic package icon for design components
        };
      });
  } catch (error) {
    console.error("Failed to read design components directory:", error);
    // Optionally, handle the error, e.g., by showing a message or logging
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {designComponents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Design Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {designComponents.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
