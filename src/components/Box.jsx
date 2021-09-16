import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function BoxComponent() {
  return (
    <Box component="span" sx={{ p: 2, border: '1px dashed grey' }}>
            <div>
            <TextField
          required
          id="outlined-required"
          label="Outbound Phone Number"
        />
        <TextField
          id="outlined-multiline-flexible"
          label="SMS Body"
          multiline
          maxRows={4}
        />
      </div>
      <Button>Send SMS</Button>
    </Box>
  );
}