import React, {useEffect, useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import {
  HvTableColumnConfig,
  HvTable,
  HvTableBody,
  HvTableContainer,
  HvTableHead,
  HvTableHeader,
  HvTableRow,
  useHvTable,
  useHvSortBy,
  useHvTableSticky,
  theme,
  HvTableCell,
  HvEmptyState,
  useHvPagination,
  HvPagination,
} from "@hitachivantara/uikit-react-core";
import { Ban } from "@hitachivantara/uikit-react-icons";

const range = (len: number) => Array.from(Array(len), (v, i) => i);

const classes = {
  root: css({}),
  container: css({
    paddingBottom: 0,
    maxHeight: 470,
    overflowY: "hidden",
  }),
  overflowVisible: css({
    overflowY: "scroll",
  }),
  loadingContainer: css({
    height: "inherit",
  }),
  pagination: css({
    zIndex: "unset",
  }),
  selectAllPages: css({
    color: theme.colors.primary,
    marginLeft: theme.spacing(["xs"]),
  }),
  tableBody: css({
    tr: {
      height: theme.spacing(5),
    },
    "tr td": {
      height: theme.spacing(5),
    },
  }),
};

const getPageCount = (totalRecords = 0, pageSize = 10) =>
  Math.max(Math.ceil(totalRecords / pageSize), 1);

const NoDataRow = ({ message }: { message: React.ReactNode }) => (
  <HvTableRow>
    <HvTableCell colSpan={100} style={{ height: 96 }}>
      <HvEmptyState message={message} icon={<Ban role="presentation" />} />
    </HvTableCell>
  </HvTableRow>
);

const EmptyRow = () => (
  <HvTableRow>
    <HvTableCell style={{ borderBottom: 0 }} colSpan={100}>
      &nbsp;
    </HvTableCell>
  </HvTableRow>
);

interface ResponsiveTableProps<T extends object = Record<string, unknown>> {
  columns: HvTableColumnConfig<T>[],
  data: T[] | undefined,
  recordCount?: number,
  showPagination?: boolean
}

const Table = <T extends object>(props: ResponsiveTableProps<T>) => {
  const {
    data,
    recordCount,
    columns,
    showPagination = true
  } = props;


  const { t } = useTranslation("common");
  const [pageCount, setPageCount] = useState(getPageCount(recordCount));
  const tableHooks = useMemo(
    () => [
      useHvTableSticky,
      useHvSortBy,
      useHvPagination,
    ],
    [],
  );

  const {
    getTableProps,
    getTableHeadProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,
    page,
    gotoPage,
    // selectedFlatRows,
    // getHvBulkActionsProps,
    getHvPaginationProps,
    state: { pageIndex, pageSize, sortBy, selectedRowIds },
  } = useHvTable<T>(
    {
      columns,
      data,
      pageCount,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      disableMultiSort: true,
      stickyHeader: true,
      // defaultColumn: { Cell: DefaultCell },
      // initialState,
      // ...options,
    },
    ...tableHooks,
  );

  useEffect(() => {
    if (!recordCount) return;

    setPageCount(getPageCount(recordCount, pageSize));
  }, [pageSize, recordCount]);

  const renderTableRow = (i: number) => {
    const { [i]: row } = page;

    if (!row) {
      // render EmptyRow only when there are multiple pages
      const showEmptyRows = pageCount > 1;
      return showEmptyRows ? <EmptyRow key={`empty-${i}`} /> : null;
    }

    prepareRow(row);

    const { key, ...rowProps } = row.getRowProps();
    return (
      <HvTableRow key={key} {...rowProps}>
        {row.cells.map((cell) => (
          <HvTableCell {...cell.getCellProps()} key={cell.getCellProps().key}>
            {cell.render("Cell")}
          </HvTableCell>
        ))}
      </HvTableRow>
    );
  };

  return (
    <>
      <HvTableContainer>
        <HvTable {...getTableProps()}>
          <HvTableHead {...getTableHeadProps?.()}>
            {headerGroups.map((headerGroup) => (
              <HvTableRow
                {...headerGroup.getHeaderGroupProps()}
                key={headerGroup.getHeaderGroupProps().key}
              >
                {headerGroup.headers.map((col) => (
                  <HvTableHeader
                    {...col.getHeaderProps()}
                    key={col.getHeaderProps().key}
                  >
                    {col.render("Header")}
                  </HvTableHeader>
                ))}
              </HvTableRow>
            ))}
          </HvTableHead>
          <HvTableBody {...getTableBodyProps()} className={classes.tableBody}>
            {!data || data.length === 0 ? (
              <NoDataRow message={t("empty")} />
            ) : (
              range(pageSize ?? 0).map(renderTableRow)
            )}
          </HvTableBody>
        </HvTable>
      </HvTableContainer>
      {showPagination && page.length > 0 && (
        <HvPagination
          classes={{ root: classes.pagination }}
          {...getHvPaginationProps?.()}
        />
      )}
    </>
  );
};

export default Table;
