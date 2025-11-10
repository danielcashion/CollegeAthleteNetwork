import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { TimeSeriesEvent } from "./EventsTable";

interface EmailListModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails?: string[]; // Keep for backward compatibility
  events?: TimeSeriesEvent[]; // New prop for full event data
  title: string;
}

export default function EmailListModal({
  isOpen,
  onClose,
  emails = [],
  events = [],
  title,
}: EmailListModalProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine which data to use - events take precedence
  const displayData = events.length > 0 ? events : emails.map(email => ({ recipient_email: email, occurred_at: '' }));
  const emailList = events.length > 0 ? events.map(e => e.recipient_email) : emails;

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`"${email}" copied to clipboard`);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 3000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(emailList.join("\n"));
    toast.success(`${emailList.length} emails copied to clipboard`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {displayData.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Copy All Emails
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white rounded-t-lg">
                <th className="px-4 py-2 text-left font-semibold w-12">
                  {/* Empty header for the icon column */}
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Email Address
                </th>
                {events.length > 0 && (
                  <th className="px-4 py-2 text-left font-semibold rounded-tr-lg">
                    Date & Time
                  </th>
                )}
                {events.length === 0 && (
                  <th className="px-4 py-2 text-left font-semibold rounded-tr-lg opacity-0">
                    {/* Spacer for when no datetime */}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
                >
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleCopyEmail(item.recipient_email)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedEmail === item.recipient_email ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 break-words">{item.recipient_email}</td>
                  {events.length > 0 && (
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {formatDateTime(('occurred_at' in item) ? item.occurred_at : '')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No email addresses found.
          </div>
        )}
      </div>
    </div>
  );
}
