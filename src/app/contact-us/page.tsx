"use client";

import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { AccountCircle, Email, School } from "@mui/icons-material";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university_name: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
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
        throw new Error("Failed to send message");
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #1C315F, #A5BECC)",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "#1C315F", textAlign: "center", fontWeight: 700 }}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <AccountCircle sx={{ color: "#1C315F", marginRight: 1 }} />
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <School sx={{ color: "#1C315F", marginRight: 1 }} />
                <TextField
                  fullWidth
                  label="University Affiliation"
                  name="university_name"
                  value={formData.university_name}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Email sx={{ color: "#1C315F", marginRight: 1 }} />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                />
              </Box>
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
                sx={{ marginBottom: 3 }}
              />
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
              {success && (
                <Alert severity="success" sx={{ marginTop: 2 }}>
                  Message sent successfully!
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ marginTop: 2 }}>
                  Failed to send the message. Please try again.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Contact;
