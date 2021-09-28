import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Manager } from "@twilio/flex-ui";

const serviceBaseUrl = "sepia-lapwing-2185.twil.io";

export default function BoxComponent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [textBody, setTextBody] = useState("");

  async function handleSendOutboundSMS() {
    const manager = Manager.getInstance();
    const token = manager.user.token;
    fetch(`https://${serviceBaseUrl}/outbound-sms`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: `token=${token}&outboundPhoneNumber=${phoneNumber}`,
      mode: "no-cors",
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Success:\r\n  ", response);
          resolve(response);
        }
      })
      .catch((error) => {
        console.error(`Error: \r\n`, error);
      });
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
        <p>Please enter outbound Phone Number with Country Code.</p>
      </div>
      <Button onClick={handleSendOutboundSMS.bind(handleSendOutboundSMS)}>
        Create Session
      </Button>
    </Box>
  );
}
