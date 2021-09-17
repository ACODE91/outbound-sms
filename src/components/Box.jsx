import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function BoxComponent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [textBody, setTextBody] = useState("");

  function handleSendOutboundSMS() {
    console.log("it works.");
  }

  return (
    <Box component="span" sx={{ p: 2, border: "1px dashed grey" }}>
      <div>
        <TextField
          required
          id="outlined-required"
          label="Outbound Phone Number"
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
        />
        <TextField
          id="outlined-multiline-flexible"
          label="SMS Body"
          multiline
          maxRows={4}
          onChange={(e) => {
            setTextBody(e.target.value);
          }}
        />
      </div>
      <Button onClick={handleSendOutboundSMS.bind(handleSendOutboundSMS)}>
        Send SMS
      </Button>
    </Box>
  );
}
