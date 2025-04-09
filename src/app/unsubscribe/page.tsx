"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CgSpinner } from "react-icons/cg";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      router.replace("/404");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/unsubscribe?row_id=${id}`);

        if (!res?.data || !Array.isArray(res.data) || res.data.length < 1) {
          router.replace("/404");
        } else {
          setData(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching unsubscribe data:", error);
        router.replace("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleUnsubscribe = async () => {
    if (!data?.row_id) return;
    setLoading(true);
    try {
      await axios.put(`/api/unsubscribe?row_id=${data.row_id}`, {
        is_subscriber_YN: 0,
        is_active_YN: 0,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Unsubscribe error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white text-center h-[80px] flex flex-col items-center px-[10%] sm:px-[20%]"></div>
        <div className="min-h-[90vh] flex justify-center items-center">
          <CgSpinner size={50} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (data && data.is_subscriber_YN === 0) {
    return (
      <div>
        <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white text-center h-[80px] flex flex-col items-center px-[10%] sm:px-[20%]"></div>

        <div className="min-h-[80vh]">
          <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded shadow">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
              Hey there, {data.email_address}
            </h3>
            <p className="text-lg mb-8 text-center">
              You have already unsubscribed from our distribution list!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh]">
      <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white text-center pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Unsubscribe</h1>
        <h2 className="text-3xl font-semibold mb-4">
          Want to opt out from newsletter and promotional emails?
        </h2>
      </div>

      <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded shadow">
        <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
          We are sorry to see {data.email_address} go!
        </h3>
        <p className="text-lg mb-8 text-center">
          Please confirm that you would like to unsubscribe from our
          distribution list.
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
              You have successfully unsubscribed from our email distribution
              list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
