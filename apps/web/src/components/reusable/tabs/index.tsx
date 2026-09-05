"use client";

import { Children, isValidElement, useCallback, useRef, useState } from "react";
import type { ReactElement } from "react";
import { InkBar } from "./ink-bar";
import { TabButton } from "./tab-button";
import { TabPanel } from "./tab-panel";
import type { TabsProps, TabPanelProps, TabItem, TabVariant } from "./types";

function Tabs({
  value: controlledValue,
  defaultValue,
  onChange,
  items,
  variant = "standard",
  centered = false,
  className = "",
  children,
}: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstValue = items[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstValue);
  const activeValue = controlledValue ?? internalValue;

  const onSelect = useCallback(
    (val: string) => {
      if (controlledValue === undefined) setInternalValue(val);
      onChange?.(val);
    },
    [controlledValue, onChange],
  );

  const isFullWidth = variant === "fullWidth";

  const panels = Children.toArray(children).filter(
    (child): child is ReactElement<TabPanelProps> =>
      isValidElement(child) && (child.type as { displayName?: string }).displayName === "TabPanel",
  );

  const activePanel = panels.find((p) => p.props.value === activeValue);

  return (
    <div className={className}>
      {/* Tab Bar */}
      <div className="relative border-b border-border">
        <div
          ref={scrollRef}
          role="tablist"
          className={`relative flex ${isFullWidth ? "w-full" : ""} ${
            centered ? "justify-center" : ""
          }`}
        >
          {items.map((item) => (
            <TabButton
              key={item.value}
              {...item}
              isActive={item.value === activeValue}
              isFullWidth={isFullWidth}
              onClick={() => onSelect(item.value)}
            />
          ))}

          <InkBar containerRef={scrollRef} activeValue={activeValue} />
        </div>
      </div>

      {/* Active Panel */}
      {activePanel}
    </div>
  );
}

export default Tabs;
export { TabPanel };
export type { TabsProps, TabPanelProps, TabItem, TabVariant };
