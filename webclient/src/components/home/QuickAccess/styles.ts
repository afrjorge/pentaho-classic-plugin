import { css } from "@emotion/css";

const styles = {
  root: ({ expanded = false }) => css({
    height: expanded ? "100%" : undefined
  }),
}

export default styles;
