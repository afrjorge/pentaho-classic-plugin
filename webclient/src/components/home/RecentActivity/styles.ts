import { css } from "@emotion/css";
import { theme } from "@hitachivantara/uikit-react-core";

const styles = {
  root: css({
    height: "100%"
  }),
  content: css({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    overflow: "auto"
  }),
  tabs: css({
    minHeight: "fit-content"
  })
}

export default styles;
