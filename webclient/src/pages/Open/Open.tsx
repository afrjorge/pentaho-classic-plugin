import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { HvButton, HvEmptyState, HvGrid, HvMultiButton, HvTypography, theme } from "@hitachivantara/uikit-react-core";
import { Ban, Edit, Preview } from "@hitachivantara/uikit-react-icons";
import {
  buildAnalyzerUrl,
  buildCDAUrl,
  buildFileGeneratedContentUrl,
  buildFileViewerUrl,
  buildPRPTIUrl
} from "../../lib/utils";

const classes = {
  root: css({
    paddingTop: theme.space.md,
    display: "flex",
    gap: theme.space.lg,
  }),
  iframe: css({
    width: "100%",
    height: "100%",
  }),

  fullHeight: css({
    height: "100%",

    "div:has(> &)": {
      height: "100%"
    }
  }),
};

const Open: React.FC = () => {
  const { t } = useTranslation("common");

  const location = useLocation();
  const { type, path, mode: initialMode } = location.state ?? {};

  const [mode, setMode] = useState(initialMode);

  const url = useMemo(() => {
    if (path == null) {
      return null;
    }

    switch (type) {
      case "xanalyzer":
        return buildAnalyzerUrl(path, mode, "en");
      case "cda":
        return buildCDAUrl(path);
      case "prpti":
        return buildPRPTIUrl(path, mode);
      case "wcdf":
      case "xcdf":
        return buildFileGeneratedContentUrl(path);

      default:
        return buildFileViewerUrl(path);
    }
  }, [type, path, mode]);

  return (
    <HvGrid container className={cx(classes.root, classes.fullHeight)}>
      <HvGrid item xs={12} className={css({ display: "flex", alignItems: "center" })}>
        <HvTypography variant="sectionTitle">File: {path}</HvTypography>
        <HvMultiButton className={css({ display: "flex", flex: "auto", justifyContent: "flex-end", paddingLeft: theme.space.sm })}>
          {[{id: "viewer", icon: <Preview /> }, { id: "editor", icon: <Edit /> }].map(({ id, icon}) => (
            <HvButton
              key={id}
              startIcon={icon}
              selected={id === mode}
              onClick={() => setMode(id)}
            >{t(id)}</HvButton>
          ))}
        </HvMultiButton>
      </HvGrid>

      <HvGrid item xs={12}>
        {url
          ? <iframe className={cx(classes.fullHeight, classes.iframe)} src={url}></iframe>
          : <HvEmptyState className={classes.fullHeight} message="No file to load!" icon={<Ban role="presentation" />} />
        }

      </HvGrid>
    </HvGrid>
  )
}

export default Open;
