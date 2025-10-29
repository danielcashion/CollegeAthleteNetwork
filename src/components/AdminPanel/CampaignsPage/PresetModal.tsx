"use client";
import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, shared: boolean) => void;
};

export default function PresetModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Save Preset</h3>
        <input
          className="w-full p-2 border rounded mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Preset name"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.currentTarget.checked)}
          />{" "}
          Share with org
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              onSave(name, shared);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
