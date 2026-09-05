import type { TabPanelProps } from "./types";

export function TabPanel({ children, className = "" }: TabPanelProps) {
  return (
    <div role="tabpanel" className={`pt-4 ${className}`}>
      {children}
    </div>
  );
}

TabPanel.displayName = "TabPanel";

export default TabPanel;
