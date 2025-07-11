"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { AccountCircle, Email, School, Phone, Mail } from "@mui/icons-material";

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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time email validation feedback
    if (name === "email" && !validateEmail(value)) {
      setError("Invalid email format");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!validateEmail(formData.email)) {
      setLoading(false);
      setError("Invalid email format");
      return;
    }

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", message: "", university_name: "" });
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
    <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-6 py-20 px-4 md:px-10 bg-[#F2F5F7]">
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

      <div className="">
        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 3,
            padding: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "#1C315F", textAlign: "center", fontWeight: 700 }}
              className="small-caps"
            >
              Contact Us
            </Typography>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#555", textAlign: "center", marginBottom: 2 }}
            >
              We would love to hear from you! Fill out the form below to get in
              touch.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <AccountCircle
                  sx={{ color: "#1C315F", marginRight: 2, fontSize: 30 }}
                />
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>

              {/* University Affiliation Field */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <School
                  sx={{ color: "#1C315F", marginRight: 2, fontSize: 30 }}
                />
                <TextField
                  fullWidth
                  label="University Affiliation/Athlete Alumni"
                  name="university_name"
                  value={formData.university_name}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>

              {/* Email Field */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Email
                  sx={{ color: "#1C315F", marginRight: 2, fontSize: 30 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  error={!!error}
                  helperText={error}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>

              {/* Message Field */}
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                  marginBottom: 3,
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#1C315F",
                  "&:hover": { backgroundColor: "#142244" },
                  borderRadius: "50px",
                  padding: "10px 20px",
                  fontWeight: "bold",
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {/* Success & Error Alerts */}
              {success && (
                <Alert severity="success" sx={{ marginTop: 2 }}>
                  Message sent successfully! You will hear from us soon!
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ marginTop: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;
