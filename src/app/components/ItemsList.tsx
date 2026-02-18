"use client";

import { ActiveItem } from "../store/cloakroomStore";

type ItemsListProps = {
  items: ActiveItem[];
  title?: string;
  emptyMessage?: string;
};

export default function ItemsList({
  items,
  title = "Checked In Items",
  emptyMessage = "No items yet.",
}: ItemsListProps) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
        <div className="badge">{items.length} active</div>
      </div>

      {items.length === 0 ? (
        <div style={{ marginTop: 10, opacity: 0.8 }}>{emptyMessage}</div>
      ) : (
        <div className="list">
          {items.map((item) => (
            <div key={item.code} className="listItem">
              <div style={{ fontWeight: 900 }}>#{item.code}</div>
              <div style={{ opacity: 0.75, fontSize: 13 }}>{item.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
