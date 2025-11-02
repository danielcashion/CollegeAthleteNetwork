export default function HtmlViewer({ htmlContent }: { htmlContent: string }) {
  return (
    <div className="w-full h-full overflow-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
