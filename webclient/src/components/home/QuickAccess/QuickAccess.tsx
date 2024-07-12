import React, {useState} from "react";
import {
  HvGrid,
  HvSection,
  HvTypography
} from "@hitachivantara/uikit-react-core";
import { DataSource, Search, SystemActivity } from "@hitachivantara/uikit-react-icons";
import { createSnackbar } from "../../../lib/utils";
import classes from "./styles";
import Card from "./Card";

// @ts-ignore
const QuickAccess = ({ title }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <HvSection
      key="quick-access"
      title={<HvTypography variant="title4">{title}</HvTypography>}
      className={classes.root({ expanded })}
      expandable
      expanded={expanded}
      onToggle={() => setExpanded((prevState) => !prevState)}
    >
      <HvGrid container>
        <HvGrid item xs={4}>
          <Card
            Icon={DataSource}
            label="Data Sources"
            description="Perform on-the-fly transformations to your data."
            onOpen={() => createSnackbar("Open Data Sources", "default")}
          />
        </HvGrid>

        <HvGrid item xs={4}>
          <Card
            Icon={Search}
            label="Schedules"
            description="View and manage your scheduled items."
            onOpen={() => createSnackbar("Open Schedules", "default")}
          />
        </HvGrid>

        <HvGrid item xs={4}>
          <Card
            Icon={SystemActivity}
            label="Activity"
            description="Monitor Activity in your environment."
            onOpen={() => createSnackbar("Open Activity", "default")}
          />
        </HvGrid>
      </HvGrid>
    </HvSection>
  )
}

export default QuickAccess;
