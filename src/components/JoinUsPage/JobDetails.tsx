"use client";
import { useState } from "react";
import { Job } from "@/utils/jobs";
import { IoClose } from "react-icons/io5";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
  },
}));

type jobDetailProps = {
  job: Job;
  setSelectedJob: any;
};

const JobDetails = ({ job, setSelectedJob }: jobDetailProps) => {
  const [applicantInfo, setApplicantInfo] = useState<any>({
    fullName: "",
    location: "",
    email: "",
    phone: "",
    aboutYou: "",
    linkedinProfile: "",
    coverLetter: "",
    otherInfo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setApplicantInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const application = {
      jobInfo: job,
      ...applicantInfo,
    };
    console.log("Submitting application:", application);
  };

  return (
    <div className="w-full py-8 px-6 sm:p-8 min-h-screen flex flex-col">
      <div className="flex flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-blueMain">Job Details</h2>
        <button
          onClick={() => setSelectedJob(null)}
          className="p-[8px] rounded-full hover:bg-gray-100"
        >
          <IoClose size={35} className="text-blueMain" />
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold">{job?.position}</h3>
          <p className="text-lg">{job?.shortDescription}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold">Description:</h3>
          <p className="text-lg">{job?.longDescription}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold">Requirements:</h3>
          <p className="text-lg">{job?.requirements}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <h3 className="text-3xl font-bold text-center text-blueMain">
          Apply Now
        </h3>
        <p className="text-center text-lg">
          Do you find yourself fit for the job? Apply now by filling the
          information below
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <StyledTextField
            label="Full Name"
            name="fullName"
            value={applicantInfo.fullName}
            onChange={handleChange}
            required
          />
          <StyledTextField
            label="Location"
            name="location"
            value={applicantInfo.location}
            onChange={handleChange}
            required
          />
          <StyledTextField
            label="Email"
            name="email"
            type="email"
            value={applicantInfo.email}
            onChange={handleChange}
            required
          />
          <StyledTextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={applicantInfo.phone}
            onChange={handleChange}
            required
          />
          <StyledTextField
            label="LinkedIn Profile (Complete URL)"
            name="linkedinProfile"
            value={applicantInfo.linkedinProfile}
            onChange={handleChange}
          />
          <StyledTextField
            label="About You"
            name="aboutYou"
            value={applicantInfo.aboutYou}
            onChange={handleChange}
            required
            multiline
            rows={4}
          />
          <StyledTextField
            label="Cover Letter"
            name="coverLetter"
            value={applicantInfo.coverLetter}
            onChange={handleChange}
            required
            multiline
            rows={6}
          />
          <StyledTextField
            label="Other Information"
            name="otherInfo"
            value={applicantInfo.otherInfo}
            onChange={handleChange}
            multiline
            rows={4}
          />
          <button
            type="submit"
            className="py-2 px-4 text-center text-lg font-medium w-full rounded-lg bg-blueMain text-white border border-blueMain hover:bg-white hover:text-blueMain transitions duration-200"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobDetails;
