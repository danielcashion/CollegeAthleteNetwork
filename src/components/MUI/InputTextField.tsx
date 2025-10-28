import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { IoClose } from "react-icons/io5";

interface InputFieldProps {
  label: string;
  type?: string;
  required?: boolean;
  value?: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  clearEnabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  required = false,
  value = "",
  setValue,
  disabled,
  placeholder,
  clearEnabled = false,
  error,
  helperText,
}) => {
  return (
    <TextField
      autoComplete="off"
      label={label}
      placeholder={placeholder ?? ""}
      variant="outlined"
      type={type}
      value={value}
      required={required}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={helperText}
      className="w-full"
      size="small"
      slotProps={{
        htmlInput: { autoComplete: "off" },
        input:
          clearEnabled && value
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={`clear ${label}`}
                      onClick={() => setValue("")}
                      edge="end"
                      size="small"
                    >
                      <IoClose />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined,
      }}
      sx={{
        backgroundColor: "white",
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
            borderColor: "var(--primary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--primary)",
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
            color: "var(--primary)",
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

export default InputField;
