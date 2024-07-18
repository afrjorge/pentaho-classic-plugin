import React from "react";
import { css } from "@emotion/css";
import {
  HvActionGeneric,
  HvButton,
  HvCard,
  HvCardContent,
  HvTypography,
  theme
} from "@hitachivantara/uikit-react-core";
import { IconType } from "@hitachivantara/uikit-react-icons";

const classes = {
  root: css({
    height: "100%",
  }),

  content: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
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

interface QuickAccessAction extends HvActionGeneric {
  onAction?: (event: React.SyntheticEvent, action: QuickAccessAction) => void;
}

interface QuickAccessCardProps {
  Icon: IconType;
  label: string;
  description: string;
  action: QuickAccessAction
}

const QuickAccessCard = ({ Icon, label, description, action }: QuickAccessCardProps) => (
  <HvCard className={classes.root}>
    <HvCardContent className={classes.content}>
      <div className={classes.icon}>
        <Icon color="neutral" iconSize="M" />
      </div>

      <div className={classes.description}>
        <HvTypography variant="label">{label}</HvTypography>
        <HvTypography>{description}</HvTypography>
      </div>

      <HvButton variant="primaryGhost" onClick={(event) => action.onAction?.(event, action)}>
        {action.label}
      </HvButton>
    </HvCardContent>
  </HvCard>
);

export default QuickAccessCard;
