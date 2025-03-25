"use client";
import React, { useState } from "react";

const Unsubscribe = ({ data }: { data: any }) => {
  console.log("data: ", data);

  const emailsData = {
    row_id: "75101a65-8cea-4558-8470-d18ee88303a4",
    email_address: "user@example.com",
  };

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex justify-center items-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded shadow">
      <h3 className="text-3xl font-semibold mb-4 text-center">
        We are sorry to see {emailsData.email_address} go!
      </h3>
      <p className="text-lg mb-8 text-center">
        Please confirm that you would like to unsubscribe from our distribution
        list.
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleUnsubscribe}
          disabled={success}
          className={`w-32 font-medium py-2 px-4 rounded ${
            success
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          UNSUBSCRIBE
        </button>
      </div>

      {success && (
        <div className="mt-8 text-center">
          <p className="text-green-600 text-lg">
            You have successfully unsubscribed from our email distribution list.
          </p>
        </div>
      )}
    </div>
  );
};

export default Unsubscribe;
