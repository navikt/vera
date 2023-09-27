import { IEventEnriched, IFilteredJsonData, IHeader } from "@/interfaces/IFilteredJsonData"

interface IGroupBy {
    [key: string]: IEventEnriched[]
}

export default function buildVersionMatrix(versionData: IEventEnriched[], inverseTable: boolean): IFilteredJsonData {
    if (inverseTable) {
        return buildVersionMatrixWithEnvsAsRows(versionData)
    }
    return buildVersionMatrixWithAppsAsRows(versionData)
}

function buildVersionMatrixWithAppsAsRows(versionData: IEventEnriched[]): IFilteredJsonData {
    const tableHeader: IHeader[] = getTableHeader(versionData, "environment")
    const applicationInstancesGroupedByApplication = groupBy("application", versionData)

    return buildVersionMatrixTable(tableHeader, applicationInstancesGroupedByApplication, "environment")
}

function buildVersionMatrixWithEnvsAsRows(versionData: IEventEnriched[]): IFilteredJsonData {
    const tableHeader: IHeader[] = getTableHeader(versionData, "application")
    const applicationInstancesGroupedByEnvironment: IGroupBy = groupBy("environment", versionData)
    return buildVersionMatrixTable(tableHeader, applicationInstancesGroupedByEnvironment, "application")
}

function buildVersionMatrixTable(
    tableHeader: IHeader[],
    applicationInstances: IGroupBy,
    columnKey: string,
): IFilteredJsonData {
    /* const rowKeys = _.sortBy(Object.keys(applicationInstances), function (elem) {
    return elem.toLowerCase();
  }); */
    const rowKeys = Object.keys(applicationInstances).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

    /* const tableContents: IFilteredJsonDataBody = [];
  _.forEach(rowKeys, function (element) {
    tableContents.push(generateRow(tableHeader, element, applicationInstances[element], columnKey));
  }); */
    const tableContents = rowKeys.map((element) =>
        generateRow(tableHeader, element, applicationInstances[element], columnKey),
    )

    return { header: tableHeader, body: tableContents }
}

function groupBy(key: string, versionData: IEventEnriched[]): IGroupBy {
    const groups: IGroupBy = {}
    for (const element of versionData) {
        const keyValue = element[key]

        if (typeof keyValue === "string") {
            if (!groups[keyValue]) {
                groups[keyValue] = []
            }

            groups[keyValue].push(element)
        }
    }
    return groups
    /*   return groups;
  return _.groupBy(versionData, function (element) {
    return element[key];
  }); */
}

function getTableHeader(versionData: IEventEnriched[], key: keyof IEventEnriched): IHeader[] {
    const headerData = [...new Set(versionData.map((item) => item[key] as string))]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .map((element: string) => {
            const queryParams = { [key]: element }
            return { columnTitle: element, queryParams: queryParams }
        })
    return [{ columnTitle: "", queryParams: {} }, ...headerData]

    /*   const toHeaderObject = (element) => {
    const queryParams = {};
    queryParams[key] = element;
    return { columnTitle: element, queryParams: queryParams };
  };

  const headerData = _.chain(versionData)
    .map(key)
    .uniq((element) => {
      return element.toLowerCase();
    })
    .sortBy(String)
    .map(toHeaderObject)
    .value();

  return [{ columnTitle: '' }].concat(headerData); */
}

function generateRow(
    columns: IHeader[],
    firstColumnTitle: string,
    applicationInstances: IEventEnriched[],
    elementKey: string,
) {
    //const rowData = Array.apply(null, Array(columns.length - 1));
    const rowData = [...Array(columns.length - 1)]
    rowData.unshift(firstColumnTitle)

    for (let i = 1; i < columns.length; i++) {
        const filtered: IEventEnriched[] = applicationInstances.filter(
            (appInstance) => appInstance[elementKey] === columns[i].columnTitle,
        )

        /*     const filtered = _.filter(applicationInstances, function (appInstance) {
      return appInstance[elementKey] === columns[i].columnTitle;
    }); */

        if (filtered.length === 1) {
            rowData[i] = filtered[0]
            //rowData[i] = _.head(filtered);
        }
    }
    return rowData
}
