const EmailUi = ({ data }: { data: any }) => {
  const styledHtml = data.body
    .replace(
      /<h2>/g,
      '<h2 style="color: #333; font-size: 16px; font-weight: 600; margin-top: 10px;">'
    )
    .replace(/<p>/g, '<p style="color: #505050; font-size: 16px;">');

  return (
    <div className="w-full border border-slate-300 rounded-xl hover:shadow-lg">
      <div className="w-full flex flex-row gap-2 items-center py-2 px-4 border-b border-b-slate-200 bg-gray-200 rounded-t-xl sticky top-0 z-10">
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-red-500"></div>
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-yellow-400"></div>
        <div className="w-[10px] h-[10px] min-w-[10px] rounded-full bg-green-500"></div>
        <div className="text-xs text-gray-600 mx-auto">
          Create Email - College Athlete Network
        </div>
      </div>

      <div className="bg-[#ffffff] rounded-b-xl">
        <div className="p-4 pb-0">
          <div className="flex mb-3 items-center border-b border-gray-200 pb-2">
            <div className="w-20 text-gray-500 font-medium">From:</div>
            <div className="flex-1 text-gray-700">name@example.com</div>
          </div>

          <div className="flex mb-3 items-center border-b border-gray-200 pb-2">
            <div className="w-20 text-gray-500 font-medium">To:</div>
            <div className="flex-1 text-gray-700">
              network@collegeathletework.org
            </div>
          </div>

          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-20 text-gray-500 font-medium">Subject:</div>
            <div className="flex-1 font-medium">{data.subject}</div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4">
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
