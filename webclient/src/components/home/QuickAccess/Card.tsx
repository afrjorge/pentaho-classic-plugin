import {HvButton, HvCard, HvCardContent, HvTypography, theme} from "@hitachivantara/uikit-react-core";
import React from "react";
import {css} from "@emotion/css";

const classes = {
  root: css({}),
  content: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),

    height: "100%",
    padding: theme.spacing("sm"),
  }),

  description: css({
    textAlign: "center",
  }),

  icon: css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    width: "60px",
    height: "60px",
    border: `1px solid ${theme.colors.atmo3}`,
    borderRadius: "10px",
    backgroundColor: theme.colors.atmo2
  })
}

// @ts-ignore
const QuickAccessCard = ({ Icon, label, description, onOpen }) => (
  <HvCard className={classes.root}>
    <HvCardContent className={classes.content}>
      <div className={classes.icon}>
        <Icon color="neutral" iconSize="M" />
      </div>

      <HvTypography variant="label">{label}</HvTypography>
      <HvTypography className={classes.description}>{description}</HvTypography>
      <HvButton variant="primaryGhost" onClick={onOpen}>Open</HvButton>
    </HvCardContent>
  </HvCard>
);

export default QuickAccessCard;
