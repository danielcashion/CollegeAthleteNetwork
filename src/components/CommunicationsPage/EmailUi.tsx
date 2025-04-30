import React, { useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa6";

interface EmailUiProps {
  data: {
    subject: string;
    body: string;
    [key: string]: any;
  };
}

const stripHtml = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
};

const EmailUi: React.FC<EmailUiProps> = ({ data }) => {
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [bodyCopied, setBodyCopied] = useState(false);

  const styledHtml = data.body
    .replace(
      /<h2>/g,
      '<h2 style="color:#333;font-size:16px;font-weight:600;margin-top:10px;">'
    )
    .replace(/<p>/g, '<p style="color:#505050;font-size:16px;">');

  const handleCopySubject = () => {
    navigator.clipboard
      .writeText(data.subject)
      .then(() => {
        setSubjectCopied(true);
        setTimeout(() => setSubjectCopied(false), 3000);
      })
      .catch(console.error);
  };

  const handleCopyBody = () => {
    const plainBody = stripHtml(data.body);
    navigator.clipboard
      .writeText(plainBody)
      .then(() => {
        setBodyCopied(true);
        setTimeout(() => setBodyCopied(false), 3000);
      })
      .catch(console.error);
  };

  return (
    <div className="w-full border border-slate-300 rounded-xl hover:shadow-lg relative">
      <div className="w-full flex flex-row gap-2 items-center py-2 px-4 border-b border-b-slate-100 bg-gray-200 rounded-t-xl sticky top-0 z-10">
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-red-500" />
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-yellow-400" />
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-green-500" />
        <div className="text-xs text-gray-600 mx-auto">
          Create Email - College Athlete Network
        </div>
      </div>

      <div className="bg-white rounded-b-xl">
        <div className="p-4 pb-0 space-y-3">
          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-20 text-gray-500 font-medium">From:</div>
            <div className="flex-1 text-gray-700">{data.from}</div>
          </div>

          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-20 text-gray-500 font-medium">To:</div>
            <div className="flex-1 text-gray-700">{data.to}</div>
          </div>

          <div className="flex items-center border-b border-gray-200 pb-2 relative">
            <div className="w-20 text-gray-500 font-medium">Subject:</div>
            <div className="flex-1 font-medium pr-6 break-words">
              {data.subject}
            </div>

            <button
              onClick={handleCopySubject}
              title={subjectCopied ? "Copied!" : "Copy subject"}
              className="absolute right-4 top-[10px] -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            >
              {subjectCopied ? (
                <FaCheck size={16} className="text-green-500" />
              ) : (
                <FaRegCopy size={16} className="opacity-40 hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 relative">
          <button
            onClick={handleCopyBody}
            title={bodyCopied ? "Copied!" : "Copy body as plain text"}
            className="absolute right-4 top-4 p-1 rounded hover:bg-gray-100 bg-white/70 backdrop-blur z-10"
          >
            {bodyCopied ? (
              <FaCheck size={16} className="text-green-500" />
            ) : (
              <FaRegCopy size={16} className="opacity-40 hover:opacity-100" />
            )}
          </button>

          <div
            className="email-body px-2"
            dangerouslySetInnerHTML={{ __html: styledHtml }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailUi;
