import {
  Card,
  CardContent,
  Grid,
  Typography,
  CardActionArea
} from "@mui/material";

const classes = {
  card: {
    width: 220,
    height: 220,
    justify: "center"
  },
  cardArea: {
    width: 220,
    height: 220,
    justify: "center",
    margin: 50,
    textDecoration: "none"
  },

  typography: {
    justify: "center"
  }
};

export const HomePageCard = ({ href, name, customIconComponent }) => (
  <CardActionArea style={classes.cardArea} href={href}>
    <Card style={classes.card} raised={true}>
      <CardContent style={{ marginTop: 10 }}>
        <Grid
          container
          direction="column"
          sx={{
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Grid>{customIconComponent}</Grid>
          <Grid>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: "#000", textAlign: "center" }}
              style={{ marginTop: 5 }}
            >
              {name}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </CardActionArea>
);
