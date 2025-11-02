import TextField from "@mui/material/TextField";

interface TextAreaFieldProps {
  label: string;
  required?: boolean;
  value?: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  required = false,
  value,
  setValue,
  disabled,
  error,
  helperText,
  rows = 4,
}) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      multiline
      rows={rows}
      value={value}
      required={required}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={helperText}
      className="w-full"
      size="small"
      sx={{
        backgroundColor: "transparent",
        "& .MuiOutlinedInput-root": {
          backgroundColor: "transparent",
          fontFamily: "var(--font-poppins)",
          "& input": {
            backgroundColor: "transparent",
            fontFamily: "var(--font-poppins)",
          },
          "& fieldset": {
            borderColor: "#cccbcb",
            borderRadius: "8px",
          },
          "&:hover fieldset": {
            borderColor: "#00356B",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#00356B",
          },
          "&.Mui-disabled .MuiInputBase-input": {
            color: "black",
            opacity: 1,
          },
        },
        "& .MuiInputLabel-root": {
          backgroundColor: "transparent",
          fontFamily: "var(--font-poppins)",
          "&.Mui-disabled": {
            color: "black",
            opacity: 1,
          },
          "&.Mui-focused": {
            color: "#00356B",
          },
        },
        "& .MuiFormHelperText-root.Mui-disabled": {
          color: "black",
        },
        "& .MuiOutlinedInput-input": {
          paddingTop: "10px",
          paddingBottom: "10px",
          fontSize: "16px",
        },
      }}
    />
  );
};

export default TextAreaField;
