import { Paper, Typography, Box, Stepper, Step, StepLabel } from "@mui/material";

const VendorPiplineOverview = () => {
    const steps = ['Invoice Submitted', 'Verified', 'Approved', 'Payment Initiated', 'Paid'];
    
    return (
        <Paper elevation={2} sx={{ borderRadius: 2, p: 2, height: 250 }}>
            <Typography variant="h5" fontWeight={600} mb={3} color="#1e293b">
                Payment Status
            </Typography>
            
            <Box sx={{ width: '100%', mt: 2 }}>
                <Stepper activeStep={2} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel 
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }
                                }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
        </Paper>
    );
}

export default VendorPiplineOverview;