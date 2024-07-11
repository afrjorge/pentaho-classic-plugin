import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { useHvNavigation } from "@hitachivantara/app-shell-navigation";
import {
  HvActionsGeneric,
  HvSection,
  HvTab,
  HvTabs,
  HvTabsProps,
  HvToggleButton,
  hvDateColumn,
  hvTextColumn
} from "@hitachivantara/uikit-react-core";
import { Heart, HeartSelected, Preview } from "@hitachivantara/uikit-react-icons";
import { useFavoriteFiles, useRecentFiles } from "../../../lib/data/useUserSettings";
import Table from "../../common/Table";
import classes from "./styles";

// recent/favorite files related to current user
// do we want to get recent files from all users in the platform?
//  - open in view mode and saving in edit mode, will update 'lastUse'
//     - TODO separate lastUse into 'lastModified' and 'lastViewed'
// - 'is favorite' information only available in favorite user setting
// - owner / who has access - is on different API
//    - /pentaho/api/repo/files/:path:to:repo:file/acl
//    - /pentaho/api/repo/files/:path:to:repo:file/properties
//
// @ts-ignore
const getColumns = (t, onAction) => [
  hvTextColumn({
    Header: "Name", // file name
    accessor: "name",
    style: { minWidth: 100 },
  }),
  hvTextColumn({
    Header: "Type", // file type
    accessor: "type",
    style: { minWidth: 80 },
    // @ts-ignore
    Cell: (row) => t(`type.${row.value}`),
  }),
  hvDateColumn(
    { Header: "Last Modified", accessor: "update", style: { minWidth: 100 } },
    "DD/MM/YYYY HH:mm",
  ),
  hvTextColumn({ Header: "Owner", accessor: "owner" }),
  {
    id: "favorite",
    // @ts-ignore
    Cell: ({ row }) => (
      <HvToggleButton
        aria-label="Favorite"
        notSelectedIcon={<Heart color="negative" />}
        selectedIcon={<HeartSelected color="negative" />}
        selected={row.isSelectionLocked}
        onClick={() => row.toggleRowLockedSelection?.()}
      />
    ),
  },
  hvTextColumn({ Header: "Who can access", accessor: "access" }),
  {
    id: "actions",
    variant: "actions",
    style: { minWidth: 80 },
    Cell: ({ row }: { row: any }) => (
      <HvActionsGeneric
        actions={[{ id: "open", label: "Open", disabled: row.original.type === "xaction" }]}
        maxVisibleActions={1}
        // @ts-ignore
        onAction={(evt, action) => onAction?.(evt, action, row)}
      />
    ),
  }
];

// @ts-ignore
const RecentActivity = ({ title }) => {
  const { t } = useTranslation("common");
  const { navigate } = useHvNavigation();

  // @ts-ignore
  const onAction = (_, action, row) => {
    if (action.id !== "open") {
      return;
    }

    const { type, path } = row.original;
    navigate({ viewBundle: "/pages/Open" }, { state: { type, path, mode: "viewer" } });
  }

  const columns = useMemo(() => getColumns(t, onAction), []);

  const { recentFiles } = useRecentFiles();
  const { favoriteFiles } = useFavoriteFiles();

  const [tab, setTab] = useState(0);

  const handleTabChange: HvTabsProps["onChange"] = (_, newTab) => {
    setTab(newTab);
  };

  const renderTabContent = (tab: number) => (
    <>
      {/* @ts-ignore*/}
      {tab === 0 && <Table columns={columns} data={recentFiles} recordCount={recentFiles?.length}/>}
      {/* @ts-ignore*/}
      {tab === 1 && <Table columns={columns} data={favoriteFiles} recordCount={favoriteFiles?.length}/>}
    </>
  );

  return (
    <HvSection key="recent-activity" title={title} className={classes.root} classes={{ content: classes.content }}>
      <HvTabs className={classes.tabs} value={tab} onChange={handleTabChange}>
        <HvTab icon={<Preview />} iconPosition="start" label="Recent" />
        <HvTab icon={<Heart />} iconPosition="start"  label="Favourites" />
      </HvTabs>

      {renderTabContent(tab)}
    </HvSection>
  )
}

export default RecentActivity;
