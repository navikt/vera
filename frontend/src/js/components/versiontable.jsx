var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var uuid = require('node-uuid');
var _ = require('lodash');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;

module.exports = VersionTable = React.createClass({

    getInitialState: function () {
        return {rowsToRender: 50};
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.tableBody.length !== this.props.tableBody.length ||
            this.state.rowsToRender !== nextState.rowsToRender ||
            nextProps.tableHeader.length !== this.props.tableHeader.length ||
            this.hasFilteredAppsChanged(this.props.tableBody, nextProps.tableBody);
    },

    hasFilteredAppsChanged: function (existingTableBody, newTableBody) {
        var getApplicationNames = function (body) {
            return body.map(function (elem) {
                return elem[0]
            });
        }
        return _.difference(getApplicationNames(existingTableBody), getApplicationNames(newTableBody)).length > 0;
    },

    render: function () {
        var showMoreLink;
        var viewAllRows = function () {
            this.setState({rowsToRender: this.props.tableBody.length});
        }.bind(this)

        var headerToRender = this.props.tableHeader;
        var bodyToRender = this.props.tableBody;
        if (this.state.rowsToRender.length != this.props.tableBody.length) {
            bodyToRender = this.props.tableBody.slice(0, this.state.rowsToRender);

            if (this.props.tableBody.length > this.state.rowsToRender) {
                showMoreLink = (
                    <div>
                        <button type="button" className="btn btn-link" onClick={viewAllRows}>View all...</button>
                    </div>
                )
            }
        }

        return (
            <div>
                <table ref="thematrix" className="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th />
                        {_.rest(headerToRender).map(function (header) {
                            return (
                                <th key={header.columnTitle} className='text-nowrap'>
                                    <Link to="log" query={header.queryParams}>{header.columnTitle.toUpperCase()}</Link>
                                </th>
                            )
                        })}
                    </tr>
                    </thead>
                    <tbody>{bodyToRender.map(this.buildTableRow)}</tbody>
                </table>
                <div>
                    {showMoreLink}
                </div>
            </div>
        )
    },

    buildTableRow: function (row) {
        var firstColumn = _.first(row);
        var dataColumns = _.rest(row);

        var labelLinkQuery = {};
        var queryElement = this.props.inverseTable ? 'environment' : 'application';
        labelLinkQuery[queryElement] = firstColumn;

        return (<tr key={uuid.v1()}>
            <td key={firstColumn}><Link to="log" query={labelLinkQuery}>{firstColumn}</Link></td>
            {dataColumns.map(function (cell) {
                    return (
                        <td key={(cell) ? cell.id : uuid.v1()} className='text-nowrap'>{this.cellContent(cell)}</td>)
                }.bind(this)
            )}</tr>)
    },


    cellContent: function (cell) {
        if (!cell) {
            return '-';
        }

        function buildTooltip(versionEntry) {
            return (
                <Tooltip>
                    {"Deployed: " + versionEntry.momentTimestamp.fromNow() + " by: " + versionEntry.deployer}
                </Tooltip>
            )
        }

        var newDeployment = this.newDeployment(cell);
        var tooltip = newDeployment ? cell.application + " has been deployed to " + cell.environment + " in the last 24 hrs" : "";
        return (
            <OverlayTrigger placement="top" overlay={buildTooltip(cell)}>
                <Link to="log" query={this.createLinkQuery(cell)} title={tooltip}>
                    {cell.version} {cell.newDeployment ? this.newDeploymentIcon() : null}
                </Link>
            </OverlayTrigger>
        );
    },

    newDeployment: function (rowElem) {
        if (!rowElem) {
            return false;
        }
        return rowElem.newDeployment;
    },

    createLinkQuery: function (cellContent) {
        return {environment: cellContent.environment, application: cellContent.application, regexp: true}
    },

    newDeploymentIcon: function () {
        return (
            <span>
                <i className="fa fa-star text-danger"></i>
            </span>
        );
    }
});
