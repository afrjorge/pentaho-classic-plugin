import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { theme } from "@hitachivantara/uikit-react-core";
import {
  buildAnalyzerUrl,
  buildCDAUrl,
  buildFileGeneratedContentUrl,
  buildPRPTIUrl
} from "../../lib/utils";

const classes = {
  root: css({
    paddingTop: theme.space.md,
    display: "flex",
    flexDirection: "column",
    gap: theme.space.lg,
  }),
  fullHeight: css({
    height: "100%",

    "div:has(> &)": {
      height: "100%"
    }
  }),
};

const Open: React.FC = () => {
  const location = useLocation();

  const { type, path, mode } = location.state ?? {};
  const url = useMemo(() => {
    switch (type) {
      case "xanalyzer":
        return buildAnalyzerUrl(path, mode, "en");
      case "cda":
        return buildCDAUrl(path);
      case "prpti":
        return buildPRPTIUrl(path, mode);

      default:
        return buildFileGeneratedContentUrl(path);
    }
  }, [type, path]);

  return (
    <div className={cx(classes.root, classes.fullHeight)}>
      <iframe className={classes.fullHeight} src={url}></iframe>
    </div>
  )
}

export default Open;
