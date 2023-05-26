import { css } from "@emotion/css";
import { theme } from "@hitachivantara/uikit-react-core";

const styles = {
  root: css({
    height: "100%",

    "& .react-resizable-hide .react-resizable-handle": {
      display: "none"
    }
  }),
  header: css({
    paddingLeft: theme.space.sm,
  }),
  recentActivity: css({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  }),
}

export default styles;
