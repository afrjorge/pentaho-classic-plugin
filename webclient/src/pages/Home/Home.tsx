import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import {
  HvButton,
  HvEmptyState,
  HvGrid,
  HvSection,
  HvTypography, theme
} from "@hitachivantara/uikit-react-core";
import { Caution, Save, Tool } from "@hitachivantara/uikit-react-icons";
import { HvDashboard } from "@hitachivantara/uikit-react-lab";
import { Custom } from "../../components/common/Custom";
import useSession from "../../lib/data/useSession";
import { LayoutConfig, postHomeDashboard, useHomeDashboard } from "../../lib/data/useUserSettings";
import { objectsEqual } from "../../lib/utils";
import classes from "./styles";

export default () => {
  const { t } = useTranslation("home");
  const { username } = useSession();
  const { dashboard } = useHomeDashboard();
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>();

  useEffect(() => {
    setLayoutConfig(dashboard);
  }, [dashboard])

  const [canDrag, setCanDrag] = useState(false);
  const [canResize, setCanResize] = useState(false);

  // @ts-ignore
  const renderFallback = ({ i, message }) => (
    <HvSection key={i} classes={{ content: css({ height: "100%" }) }}>
      <HvEmptyState
        icon={<Caution role="none" />}
        message={message ?? "No widget to display"}
      />
    </HvSection>
  );

  const renderItem = ({ i }: NonNullable<LayoutConfig["layout"]>[0]) => {
    const widgetToDisplay = layoutConfig?.widgets?.find(({ id }) => id === i);

    if (widgetToDisplay?.module == null) {
      return renderFallback({ i, message: widgetToDisplay?.moduleProps?.title });
    }

    return (
      <div key={i}>
        <Custom
          module={widgetToDisplay.module}
          moduleProps={{
            ...widgetToDisplay.moduleProps,
            fullHeight: true,
          }}
        />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <HvGrid container flexDirection="column">
        <HvGrid container item justifyContent="space-between">
          <HvGrid item>
            <div className={classes.header}>
              <HvTypography variant="xxsTitle">{t("title")}</HvTypography>
              <HvTypography variant="mTitle">{username}</HvTypography>
            </div>
          </HvGrid>
          <HvGrid item>
            <HvButton
              variant="secondaryGhost"
              startIcon={<Save />}
              onClick={() => postHomeDashboard(layoutConfig)}
            >
              {`Save dashboard`}
            </HvButton>
            <HvButton
              variant="secondaryGhost"
              startIcon={<Tool />}
              onClick={() => setCanDrag((prev) => !prev)}
            >
              {`Drag is ${canDrag ? "no" : "off"}`}
            </HvButton>
            <HvButton
              variant="secondaryGhost"
              startIcon={<Tool />}
              onClick={() => setCanResize((prev) => !prev)}
            >
              {`Resize is ${canResize ? "on" : "off"}`}
            </HvButton>
          </HvGrid>
        </HvGrid>

        <HvGrid item>
          <HvDashboard
            cols={layoutConfig?.cols}
            isDraggable={canDrag}
            isResizable={canResize}
            layout={layoutConfig?.layout}
            onLayoutChange={(ly) => {
              if (!objectsEqual(ly, layoutConfig?.layout, true)) {
                setLayoutConfig((prevConfig) => ({
                  ...prevConfig,
                  layout: ly,
                }));
              }
            }}
          >
            {layoutConfig?.layout?.map(renderItem)}
          </HvDashboard>
        </HvGrid>
      </HvGrid>
    </div>
  );
}


