import {
    Box,
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";

function JoinScreen({ userName, setUserName, joinChat }) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100"
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: 400,
                    p: 4,
                    borderRadius: 3
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign="center"
                    gutterBottom
                >
                    Chat App
                </Typography>

                <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                >
                    Enter your name to join the chat
                </Typography>

                <TextField
                    fullWidth
                    label="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            joinChat();
                        }
                    }}
                    sx={{ mb: 2 }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={joinChat}
                    disabled={!userName.trim()}
                >
                    Join Chat
                </Button>
            </Paper>
        </Box>
    );
}

export default JoinScreen;