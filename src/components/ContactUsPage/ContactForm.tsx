"use client";
import Link from "next/link";
import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import { AccountCircle, Email, School, Phone, Mail } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import ContactSuccessModal from "./ContactSuccessModal";

// Utility function for email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university_name: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time email validation feedback
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setError("Invalid email format");
      } else {
        setError(null);
      }
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) {
      setError(null); // Clear error if reCAPTCHA is completed
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      validateEmail(formData.email) &&
      formData.university_name.trim() !== "" &&
      formData.message.trim() !== "" &&
      recaptchaToken !== null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateEmail(formData.email)) {
      setLoading(false);
      setError("Invalid email format");
      return;
    }

    if (!recaptchaToken) {
      setLoading(false);
      setError("Please complete the reCAPTCHA verification");
      return;
    }

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ name: "", email: "", message: "", university_name: "" });
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to send message");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 py-20 px-4 md:px-10 bg-[#F2F5F7]">
      <div className="flex flex-col items-center w-full lg:w-[730px]">
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <Link
            href={"mailto:admin@collegeathletenetwork.org"}
            className="w-full rounded-lg border border-[#1C315F] bg-[#1C315F] text-white px-8 py-6 flex flex-col items-center gap-4 hover:bg-white hover:text-[#1c315f] transitions duration-200"
          >
            <Mail sx={{ fontSize: 60 }} />
            <p className="text-lg">admin@collegeathletenetwork.org</p>
          </Link>
          <Link
            href={"tel:+12123777020"}
            className="w-full rounded-lg border border-[#1C315F] bg-[#1C315F] text-white px-8 py-6 flex flex-col items-center gap-4 hover:bg-white hover:text-[#1c315f] transitions duration-200"
          >
            <Phone sx={{ fontSize: 60 }} />
            <p className="text-lg">+1 212 377 7020</p>
          </Link>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3823.600013864663!2d-74.0131689!3d40.7130082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25bc9f2bc8c6d%3A0xe485c4ba314e68a9!2sThe%20College%20Athlete%20Network%20LLC!5e1!3m2!1sen!2sus!4v1749746963698!5m2!1sen!2sus"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[400px] mt-6 rounded-lg"
        ></iframe>
      </div>

      <div className="relative">
        <Card
          sx={{
            boxShadow: "0 20px 40px rgba(28, 49, 95, 0.15)",
            borderRadius: 4,
            padding: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid rgba(28, 49, 95, 0.08)",
            position: "relative",
            overflow: "visible",
            fontFamily: "var(--font-open-sans), sans-serif",
          }}
        >
          {/* Decorative accent */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #1C315F 0%, #2563eb 50%, #1C315F 100%)",
              borderRadius: "16px 16px 0 0",
            }}
          />
          <CardContent sx={{ padding: "32px !important" }}>
            <Box sx={{ textAlign: "center", marginBottom: 4 }}>
              <Typography
                variant="h4"
                sx={{ 
                  color: "#1C315F", 
                  fontWeight: 700,
                  marginBottom: 1,
                  fontSize: { xs: "1.75rem", sm: "2.125rem" }
                }}
                className="small-caps"
              >
                Contact Us
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ 
                  color: "#64748b", 
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  maxWidth: "400px",
                  margin: "0 auto",
                  lineHeight: 1.6
                }}
              >
                We would love to hear from you! Fill out the form below and we&apos;ll get back to you as soon as possible.
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <AccountCircle
                    sx={{ color: "#1C315F", marginRight: 2, fontSize: 24 }}
                  />
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 600 }}>
                    Full Name *
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        border: "2px solid #1C315F",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </Box>

              {/* University Affiliation Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <School
                    sx={{ color: "#1C315F", marginRight: 2, fontSize: 24 }}
                  />
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 600 }}>
                    University Affiliation *
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="university_name"
                  value={formData.university_name}
                  onChange={handleChange}
                  required
                  placeholder="Your university or athletic background"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        border: "2px solid #1C315F",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </Box>

              {/* Email Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Email
                    sx={{ color: "#1C315F", marginRight: 2, fontSize: 24 }}
                  />
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 600 }}>
                    Email Address *
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  error={!!error && error.includes("email")}
                  helperText={error && error.includes("email") ? error : ""}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        border: "2px solid #1C315F",
                      },
                      "&.Mui-error": {
                        border: "2px solid #ef4444",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </Box>

              {/* Message Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="body2" sx={{ color: "#374151", fontWeight: 600, marginBottom: 1 }}>
                  Message *
                </Typography>
                <TextField
                  fullWidth
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  placeholder="Tell us how we can help you..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        border: "2px solid #1C315F",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </Box>

              {/* reCAPTCHA */}
              <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={handleRecaptchaChange}
                  onExpired={() => setRecaptchaToken(null)}
                  onErrored={() => {
                    setRecaptchaToken(null);
                    setError("reCAPTCHA verification failed. Please try again.");
                  }}
                  size="normal"
                  theme="light"
                />
              </Box>

              {/* Submit Button */}
              <Tooltip 
                title={!isFormValid() ? "When all fields are filled out, the Send Button becomes enabled." : ""}
                arrow
                placement="top"
              >
                <span>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      background: "linear-gradient(135deg, #1C315F 0%, #2563eb 100%)",
                      "&:hover": { 
                        background: "linear-gradient(135deg, #142244 0%, #1d4ed8 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(28, 49, 95, 0.3)",
                      },
                      "&:disabled": {
                        background: "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)",
                        transform: "none",
                        boxShadow: "none",
                      },
                      borderRadius: "12px",
                      padding: "14px 20px",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      textTransform: "none",
                      boxShadow: "0 4px 15px rgba(28, 49, 95, 0.2)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: "2px solid #ffffff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }}
                        />
                        <span>Sending Message...</span>
                      </Box>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </span>
              </Tooltip>

              {/* Error Alert */}
              {error && !error.includes("email") && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    marginTop: 3,
                    borderRadius: "12px",
                    border: "1px solid #ef4444",
                    backgroundColor: "#fef2f2",
                    "& .MuiAlert-icon": {
                      color: "#dc2626",
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#dc2626" }}>
                    {error}
                  </Typography>
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <ContactSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  );
};

export default ContactForm;
