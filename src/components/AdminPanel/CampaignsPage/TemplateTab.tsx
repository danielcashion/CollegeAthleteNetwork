"use client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import InputField from "@/components/MUI/InputTextField";
import { useSession } from "next-auth/react";
import SaveTemplateModal from "./SaveTemplateModal";
import ImportTemplateModal from "./ImportTemplateModal";
import PreviewModal from "./PreviewModal";
import EditorSwitchWarningModal from "./EditorSwitchWarningModal";
import StyledTooltip from "@/components/common/StyledTooltip";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { CUSTOM_FIELDS } from "@/utils/ECommUtils";
import { useUniversitiesStore } from "@/store/universitiesStore";
import { FiEdit2, FiX, FiCheck } from "react-icons/fi";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Props = {
  onNextAction?: () => void;
  onBackAction?: () => void;
  commType: "general" | "event";
  setCommTypeAction: (value: "general" | "event") => void;
  senderName: string;
  setSenderNameAction: (value: string) => void;
  senderEmail: string;
  setSenderEmailAction: (value: string) => void;
  replyTo: string;
  setReplyToAction: (value: string) => void;
  subject: string;
  setSubjectAction: (value: string) => void;
  body: string;
  setBodyAction: (value: string) => void;
  editorType: "text-editor" | "html";
  setEditorTypeAction: (value: "text-editor" | "html") => void;
  colorScheme: "university" | "default";
  setColorSchemeAction: (value: "university" | "default") => void;
  includeUniversityLogo: boolean;
  setIncludeUniversityLogoAction: (value: boolean) => void;
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
};

export default function TemplateTab({
  onNextAction,
  onBackAction,
  commType,
  setCommTypeAction,
  senderName,
  setSenderNameAction,
  senderEmail,
  setSenderEmailAction,
  replyTo,
  setReplyToAction,
  subject,
  setSubjectAction,
  body,
  setBodyAction,
  editorType,
  setEditorTypeAction,
  colorScheme,
  setColorSchemeAction,
  includeUniversityLogo,
  setIncludeUniversityLogoAction,
  campaignName,
  onCampaignNameUpdate,
}: Props) {
  const { data: session } = useSession();

  const { universityMetaData } = useUniversitiesStore();
  console.log("University Meta Data:", universityMetaData);

  const quillRef = useRef<any>(null);
  const monacoEditorRef = useRef<any>(null);

  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [importTemplateModalOpen, setImportTemplateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editorSwitchWarningOpen, setEditorSwitchWarningOpen] = useState(false);
  const [pendingEditorType, setPendingEditorType] = useState<
    "text-editor" | "html" | null
  >(null);
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");

  // Wait for component to mount and try to get quill instance
  useEffect(() => {
    const timer = setTimeout(() => {
      const quillElement = document.querySelector(".ql-editor");
      if (quillElement && (quillElement as any).__quill) {
        quillRef.current = (quillElement as any).__quill;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Function to get the quill editor instance
  const getQuillEditor = () => {
    // Try cached reference first
    if (quillRef.current) {
      return quillRef.current;
    }

    // Fallback to DOM query
    const quillElement = document.querySelector(".ql-editor");
    if (quillElement && (quillElement as any).__quill) {
      quillRef.current = (quillElement as any).__quill;
      return quillRef.current;
    }
    return null;
  };

  const handleEditorTypeChange = (newType: "text-editor" | "html") => {
    // If switching from HTML to Rich Text, show warning
    if (editorType === "html" && newType === "text-editor") {
      setPendingEditorType(newType);
      setEditorSwitchWarningOpen(true);
    } else {
      // Safe switch (Rich Text to HTML or same type)
      setEditorTypeAction(newType);
    }
  };

  const confirmEditorTypeChange = () => {
    if (pendingEditorType) {
      setEditorTypeAction(pendingEditorType);
    }
    setEditorSwitchWarningOpen(false);
    setPendingEditorType(null);
  };

  const cancelEditorTypeChange = () => {
    setEditorSwitchWarningOpen(false);
    setPendingEditorType(null);
  };

  const insertCustomField = (fieldValue: string) => {
    if (editorType === "text-editor") {
      const quill = getQuillEditor();

      if (quill) {
        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();

        // Insert the field value at the cursor position
        quill.insertText(index, fieldValue);

        // Set cursor position after the inserted text
        quill.setSelection(index + fieldValue.length);

        // Focus the editor
        quill.focus();
      } else {
        // Fallback: append to the end
        const needsSpace = body && !body.endsWith(" ") && !body.endsWith("\n");
        const insertValue = needsSpace ? " " + fieldValue : fieldValue;
        setBodyAction(body + insertValue);
      }
    } else {
      // For HTML editor (Monaco), insert at cursor position
      if (monacoEditorRef.current) {
        const editor = monacoEditorRef.current;
        const position = editor.getPosition();

        if (position) {
          // Insert text at current cursor position
          editor.executeEdits("insert-custom-field", [
            {
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              text: fieldValue,
            },
          ]);

          // Move cursor to end of inserted text
          const newPosition = {
            lineNumber: position.lineNumber,
            column: position.column + fieldValue.length,
          };
          editor.setPosition(newPosition);
          editor.focus();
        } else {
          // Fallback: append to the end
          const needsSpace =
            body && !body.endsWith(" ") && !body.endsWith("\n");
          const insertValue = needsSpace ? " " + fieldValue : fieldValue;
          setBodyAction(body + insertValue);
        }
      } else {
        // Fallback: append to the end
        const needsSpace = body && !body.endsWith(" ") && !body.endsWith("\n");
        const insertValue = needsSpace ? " " + fieldValue : fieldValue;
        setBodyAction(body + insertValue);
      }
    }
  };

  // Campaign name editing functions
  const startEditingCampaignName = () => {
    setTempCampaignName(campaignName || "");
    setIsEditingCampaignName(true);
  };

  const cancelEditingCampaignName = () => {
    setTempCampaignName("");
    setIsEditingCampaignName(false);
  };

  const saveCampaignName = async () => {
    if (tempCampaignName.trim() && onCampaignNameUpdate) {
      try {
        await onCampaignNameUpdate(tempCampaignName.trim());
        setIsEditingCampaignName(false);
        setTempCampaignName("");
      } catch (error) {
        toast.error("Failed to update campaign name");
      }
    } else {
      cancelEditingCampaignName();
    }
  };

  const handleCampaignNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveCampaignName();
    } else if (e.key === "Escape") {
      cancelEditingCampaignName();
    }
  };

  const handleTemplateSelect = (template: {
    senderName: string;
    subject: string;
    body: string;
    replyToAddress?: string;
  }) => {
    setSenderNameAction(template.senderName);
    setSubjectAction(template.subject);
    setBodyAction(template.body);
    if (template.replyToAddress) {
      setReplyToAction(template.replyToAddress);
    }
  };

  // Get university affiliation from session for the modal
  const universityName =
    (session as any)?.user?.university_affiliation || "Yale";

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* ReactQuill custom styling */
        :global(.ql-editor) {
          min-height: 400px !important;
          font-family: inherit;
        }

        :global(.ql-container) {
          min-height: 450px !important;
          font-family: inherit;
        }

        :global(.ql-toolbar) {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }

        :global(.ql-container.ql-snow) {
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
      `}</style>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Design Message</h2>
            <div className="text-md text-gray-500">
              Import from template library or create a custom message with
              placeholders.
            </div>
          </div>
          <div className="text-right text-xl font-bold text-primary">
            Campaign Name:{" "}
            {isEditingCampaignName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempCampaignName}
                  onChange={(e) => setTempCampaignName(e.target.value)}
                  onKeyDown={handleCampaignNameKeyPress}
                  className="px-2 py-1 border border-gray-300 rounded text-sm font-normal"
                  placeholder="Enter campaign name"
                  autoFocus
                />
                <button
                  onClick={saveCampaignName}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Save campaign name"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={cancelEditingCampaignName}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Cancel editing"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={startEditingCampaignName}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Edit campaign name"
                >
                  <FiEdit2 size={16} />
                </button>
                {campaignName ? (
                  <div className="font-normal hover:text-green-600">
                    {campaignName}
                  </div>
                ) : (
                  <div className="italic text-gray-400">Unnamed Campaign</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row items-start gap-4 mb-4">
          <div className="w-full flex gap-2 items-center">
            <StyledTooltip
              title="Save the current email template for future use"
              placement="top"
              arrow
            >
              <button
                className="bg-white border text-sm px-3 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
                onClick={() => setSaveTemplateModalOpen(true)}
                aria-label="Save current template for future use"
              >
                Save as a Template
              </button>
            </StyledTooltip>
            <StyledTooltip
              title="Import a saved template from the library"
              placement="top"
              arrow
            >
              <button
                className="bg-white  border px-3 py-2 text-sm rounded shadow-lg hover:font-bold transition-all duration-200"
                onClick={() => setImportTemplateModalOpen(true)}
                aria-label="Import template from library"
              >
                Import a Template
              </button>
            </StyledTooltip>
            <StyledTooltip
              title="Preview the current email before sending"
              placement="top"
              arrow
            >
              <button
                className="bg-primary text-white px-3 py-2 text-sm rounded shadow-lg hover:font-bold transition-all duration-200"
                onClick={() => setPreviewModalOpen(true)}
                aria-label="Preview email template before sending"
              >
                Preview Email
              </button>
            </StyledTooltip>
          </div>
        </div>
        <div className="flex flex-row items-start gap-4 mb-4">
          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Editor Type
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="editor-type-label"
              >
                <StyledTooltip
                  title="Try to use HTML for more control over styling"
                  arrow
                  placement="top"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editorType"
                      value="html"
                      checked={editorType === "html"}
                      onChange={() => handleEditorTypeChange("html")}
                      className="accent-sky-600"
                      aria-describedby="editor-html-desc"
                    />
                    HTML Editor
                  </label>
                </StyledTooltip>
                <span id="editor-html-desc" className="sr-only">
                  Use HTML editor with syntax highlighting
                </span>
                <StyledTooltip
                  title="Try to avoid Rich Text, as it results in less impactful messages"
                  arrow
                  placement="right"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editorType"
                      value="text-editor"
                      checked={editorType === "text-editor"}
                      onChange={() => handleEditorTypeChange("text-editor")}
                      className="accent-sky-600"
                      aria-describedby="editor-text-desc"
                    />
                    Rich Text Editor
                  </label>
                </StyledTooltip>
                <span id="editor-text-desc" className="sr-only">
                  Use rich text editor with formatting toolbar
                </span>
              </div>
            </fieldset>
          </div>

          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Color Scheme:
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="color-scheme-label"
              >
                <StyledTooltip
                  title="Use the primary color of your university"
                  arrow
                  placement="top"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorScheme"
                      value="university"
                      checked={colorScheme === "university"}
                      onChange={() => setColorSchemeAction("university")}
                      className="accent-sky-600"
                      aria-describedby="color-university-desc"
                    />
                    University Colors
                  </label>
                </StyledTooltip>
                <span id="color-university-desc" className="sr-only">
                  Use your university&apos;s brand colors for the email template
                </span>
                <StyledTooltip
                  title="Use the default color theme our App (dark blue)"
                  arrow
                  placement="top"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorScheme"
                      value="default"
                      checked={colorScheme === "default"}
                      onChange={() => setColorSchemeAction("default")}
                      className="accent-sky-600"
                      aria-describedby="color-default-desc"
                    />
                    App Default
                  </label>
                </StyledTooltip>
                <span id="color-default-desc" className="sr-only">
                  Use the College Athlete Network default color scheme
                </span>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="flex flex-row items-start gap-4">
          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Communication Type
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="comm-type-label"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="commType"
                    value="general"
                    checked={commType === "general"}
                    onChange={() => setCommTypeAction("general")}
                    className="accent-sky-600"
                    aria-describedby="comm-general-desc"
                  />
                  General Communication
                </label>
                <span id="comm-general-desc" className="sr-only">
                  Send general communications to recipients
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="commType"
                    value="event"
                    checked={commType === "event"}
                    onChange={() => setCommTypeAction("event")}
                    className="accent-sky-600"
                    aria-describedby="comm-event-desc"
                  />
                  Event Specific
                </label>
                <span id="comm-event-desc" className="sr-only">
                  Send event-specific communications with event details
                </span>
              </div>
            </fieldset>
          </div>

          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Include University Logo in HTML:
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="university-logo-label"
              >
                <StyledTooltip placement="left" title="Recommended">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="universityLogo"
                      value="yes"
                      checked={includeUniversityLogo}
                      onChange={() => setIncludeUniversityLogoAction(true)}
                      className="accent-sky-600"
                      aria-describedby="logo-yes-desc"
                    />
                    Yes
                  </label>
                </StyledTooltip>
                <span id="logo-yes-desc" className="sr-only">
                  Include university logo in the email header
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="universityLogo"
                    value="no"
                    checked={!includeUniversityLogo}
                    onChange={() => setIncludeUniversityLogoAction(false)}
                    className="accent-sky-600"
                    aria-describedby="logo-no-desc"
                  />
                  No
                </label>
                {/* Copy to Clipboard control next to 'No' */}
                <div className="flex items-center gap-2">
                  <StyledTooltip
                    title="HTML that can be placed in the below code to include your logo."
                    arrow
                    placement="bottom"
                  >
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const htmlString =
                          '<img id="university_logo" src="{{university_logo}}" alt="{{university_name}} Athlete Network" style="width:120px;height:120px;display:block;" width="120" height="120" />';
                        try {
                          await navigator.clipboard.writeText(htmlString);
                          toast.success("Copied to clipboard");
                        } catch (err) {
                          console.error("Failed to copy:", err);
                          toast.error("Failed to copy to clipboard");
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      aria-label="Copy university logo HTML to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML to Clipboard</span>
                    </button>
                  </StyledTooltip>
                </div>
                <span id="logo-no-desc" className="sr-only">
                  Do not include university logo in the email
                </span>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          {/* Sender and Reply to fields in a row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <StyledTooltip
                title="This is the name that will appear as the sender of the email"
                arrow
                placement="top"
              >
                <InputField
                  label="Sender Name"
                  placeholder="Sender Name"
                  required
                  value={senderName}
                  setValue={setSenderNameAction}
                />
              </StyledTooltip>
            </div>
            <div className="flex-1">
              <InputField
                label="Sender Email"
                placeholder="Sender email"
                type="email"
                required
                value={senderEmail}
                setValue={setSenderEmailAction}
                disabled={true}
              />
            </div>
            <div className="flex-1">
              <InputField
                label="Reply To "
                placeholder="Reply-to email"
                type="email"
                value={replyTo}
                setValue={setReplyToAction}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <InputField
              label="Subject"
              placeholder="Enter email subject"
              value={subject}
              setValue={setSubjectAction}
              required
            />
          </div>

          <div className="flex gap-4">
            {/* Rich Text Editor or HTML Editor */}
            <div className="flex-1">
              <StyledTooltip
                title="If unfamiliar with writng HTML, get started by importing a template using the top right button for importing."
                arrow
                placement="left"
              >
                <label
                  className="block text-sm mb-2 font-medium text-gray-700"
                  id="message-body-label"
                >
                  HTML Message Body
                </label>
              </StyledTooltip>
              {editorType === "text-editor" ? (
                <div role="region" aria-labelledby="message-body-label">
                  <ReactQuill
                    theme="snow"
                    value={body}
                    onChange={setBodyAction}
                    placeholder="Write your message here. You can use the custom fields from the panel on the right..."
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ color: [] }, { background: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ indent: "-1" }, { indent: "+1" }],
                        [{ align: [] }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "color",
                      "background",
                      "list",
                      "indent",
                      "align",
                      "link",
                    ]}
                  />
                </div>
              ) : (
                <div
                  className="border border-gray-300 rounded-lg overflow-hidden"
                  role="region"
                  aria-labelledby="message-body-label"
                >
                  <Editor
                    height="500px"
                    defaultLanguage="html"
                    value={body}
                    onChange={(value) => setBodyAction(value || "")}
                    onMount={(editor) => {
                      monacoEditorRef.current = editor;
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      theme: "vs",
                      formatOnPaste: true,
                      formatOnType: true,
                      autoIndent: "full",
                      bracketPairColorization: {
                        enabled: true,
                      },
                    }}
                    theme="vs"
                  />
                </div>
              )}
            </div>

            {/* Custom Fields Panel */}
            <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                Custom Fields
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Click any field below to insert it into your message. These will
                be automatically replaced with actual data when emails are sent.
                {editorType === "html" &&
                  " Perfect for HTML templates with dynamic content!"}
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {CUSTOM_FIELDS.map((field, index) => (
                  <button
                    key={index}
                    onClick={() => insertCustomField(field.value)}
                    className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 hover:shadow-sm transition-all duration-200 text-sm group"
                    aria-label={`Insert ${field.label} placeholder (${field.value}) into message`}
                  >
                    <div className="font-medium text-gray-700 group-hover:text-primary transition-colors duration-200">
                      {field.label}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1 bg-gray-50 group-hover:bg-blue-100 px-2 py-1 rounded transition-colors duration-200">
                      {field.value}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> You can also type these variables
                  directly into your message
                  {editorType === "html" ? " or paste HTML code" : ""}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="bg-gray-100 px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
            onClick={onBackAction}
            aria-label="Go back to previous step"
          >
            Back
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded shadow hover:font-bold transition-all duration-200"
            onClick={onNextAction}
            aria-label="Continue to review and verify email campaign"
          >
            Next: Review & Send Test
          </button>
        </div>
      </div>

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={saveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
        session={session}
        templateData={{
          senderName,
          senderEmail,
          replyTo,
          subject,
          body,
          editorType,
        }}
        onSaved={(templateId) => {
          console.log("Template saved with ID:", templateId);
          // You can add additional logic here if needed
        }}
      />

      {/* Import Template Modal */}
      <ImportTemplateModal
        isOpen={importTemplateModalOpen}
        onCloseAction={() => setImportTemplateModalOpen(false)}
        universityName={universityName}
        onTemplateSelectAction={handleTemplateSelect}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        body={body}
        session={session}
        universityMetaData={universityMetaData}
        includeUniversityLogo={includeUniversityLogo}
        colorScheme={colorScheme}
      />

      {/* Editor Switch Warning Modal */}
      <EditorSwitchWarningModal
        isOpen={editorSwitchWarningOpen}
        onClose={cancelEditorTypeChange}
        onConfirm={confirmEditorTypeChange}
      />
    </>
  );
}
