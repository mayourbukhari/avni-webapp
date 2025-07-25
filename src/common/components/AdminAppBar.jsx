import { AppBar } from "react-admin";
import { Typography, IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Home } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrganisationOptions from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import CurrentUserService from "../service/CurrentUserService";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 1em",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  boxShadow: "0 4px 20px 0px rgba(0,0,0,0.14), 0 7px 10px -5px rgba(156,39,176,0.4)",
  "& .MuiToolbar-root": {
    width: "100%",
    minHeight: "auto",
    justifyContent: "space-between",
    display: "flex",
    alignItems: "center",
    padding: 0,
    [theme.breakpoints.down('md')]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: theme.spacing(1),
      padding: theme.spacing(1, 0)
    }
  }
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
  fontWeight: "bold",
  fontSize: "1.25rem",
  color: "#ffffff",
  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  [theme.breakpoints.down('md')]: {
    fontSize: "1.1rem",
    marginBottom: theme.spacing(0.5)
  }
}));

const AdminAppBar = props => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const organisation = useSelector(state => state.app.organisation);
  const authSession = useSelector(state => state.app.authSession);
  const organisations = useSelector(state => state.app.organisations);
  const userInfo = useSelector(state => state.app.userInfo);

  return (
    <StyledAppBar {...props}>
      <StyledTypography
        variant="h6"
        sx={{ color: "inherit" }}
        id="react-admin-title"
      />

      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1, 
        flexWrap: "wrap",
        "& .MuiIconButton-root": {
          backgroundColor: "rgba(255,255,255,0.1)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.2)"
          }
        }
      }}>
        <OrganisationOptions
          getUserInfo={() => dispatch(getUserInfo())}
          user={authSession}
          userInfo={userInfo}
          organisation={organisation}
          organisations={organisations}
        />
        <Box sx={{ 
          mx: 2, 
          color: "#ffffff",
          fontWeight: 500,
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          display: { xs: "none", sm: "block" }
        }}>
          <b>{organisation?.name}</b> ({authSession?.username})
        </Box>
        {/* Mobile view for user info */}
        <Box sx={{ 
          display: { xs: "block", sm: "none" },
          fontSize: "0.875rem",
          color: "#ffffff",
          fontWeight: 500,
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
        }}>
          {organisation?.name} - {authSession?.username}
        </Box>
        {CurrentUserService.hasOrganisationContext(userInfo) && (
          <Box>
            <IconButton
              onClick={() => navigate("/home")}
              aria-label="Home"
              color="inherit"
              size="large"
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)"
                }
              }}
            >
              <Home />
            </IconButton>
          </Box>
        )}
      </Box>
    </StyledAppBar>
  );
};

export default AdminAppBar;
