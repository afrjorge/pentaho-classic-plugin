import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { HvTab, HvTabs, HvTabsProps, HvTypography } from "@hitachivantara/uikit-react-core";
import { Heart, Preview } from "@hitachivantara/uikit-react-icons";
import { useFavoriteFiles, useRecentFiles } from "../../../lib/data/useUserSettings";
import Table from "../../common/Table";

// recent/favorite files related to current user
// do we want to get recent files from all users in the platform?
//  - open in view mode and saving in edit mode, will update 'lastUse'
//     - TODO separate lastUse into 'lastModified' and 'lastViewed'
// - 'is favorite' information only available in favorite user setting
// - owner / who has access - is on different API
//    - /pentaho/api/repo/files/:path:to:repo:file/acl
//    - /pentaho/api/repo/files/:path:to:repo:file/properties
//
const getColumns = (t) => [
  {
    Header: "Name", // file name
    accessor: "name",
    style: { minWidth: 120 },
  },
  {
    Header: "Type", // file type
    accessor: "type",
    style: { minWidth: 100 },
    Cell: (row) => t(`type.${row.value}`),
  },
  {
    Header: "Last Modified", // time and user
    accessor: "update",
    style: { minWidth: 100 },
    // Cell: (row) => (<div>{new Date(row.value)}</div>),
  },
  { Header: "Owner", accessor: "owner", Cell: () => "not implemented", },
  // { Header: "is favorite?", accessor: "priority" },
  { Header: "Who can access", accessor: "access", Cell: () => "not implemented", },
  // { Header: "Actions", accessor: "priority" },
];

const RecentActivity = () => {
  const { t } = useTranslation("common");

  const columns = useMemo(() => getColumns(t), []);

  const { recentFiles } = useRecentFiles();
  const { favoriteFiles } = useFavoriteFiles();

  const [tab, setTab] = useState(0);

  const handleTabChange: HvTabsProps["onChange"] = (_, newTab) => {
    setTab(newTab);
  };

  const renderTabContent = (tab: number) => (
    <>
      {tab === 0 && <Table columns={columns} data={recentFiles} recordCount={recentFiles?.length}/>}
      {tab === 1 && <Table columns={columns} data={favoriteFiles} recordCount={favoriteFiles?.length}/>}
    </>
  );

  return (
    <>
      <HvTypography variant="label">Based on your recent activity (WIP)</HvTypography>

      <HvTabs value={tab} onChange={handleTabChange}>
        <HvTab icon={<Preview />} iconPosition="start" label="Recent" />
        <HvTab icon={<Heart />} iconPosition="start"  label="Favourites" />
      </HvTabs>

      {renderTabContent(tab)}
    </>
  )
}

export default RecentActivity;
