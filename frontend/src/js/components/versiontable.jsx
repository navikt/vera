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
        return this.props.versionData !== nextProps.versionData || this.state.rowsToRender !== nextState.rowsToRender
    },

    render: function () {
        var showMoreLink;

        var viewAllRows = function () {
            this.setState({rowsToRender: this.props.versionData.body.length});
        }.bind(this)

        var headerToRender = this.props.versionData.header || [];
        var bodyToRender = this.props.versionData.body || [];

        if (bodyToRender.length > this.state.rowsToRender) {
            bodyToRender = bodyToRender.slice(0, this.state.rowsToRender);
            showMoreLink = (
                <div>
                    <button type="button" className="btn btn-link" onClick={viewAllRows}>View all...</button>
                </div>
            )
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

        var me = this;

        function buildTooltip(versionEntry) {
            var newDeploymentLegend = <div><small>{me.newDeploymentIcon()}: deployed in the last 24 hrs</small></div>

            return (
                <Tooltip>
                    <div>{versionEntry.momentTimestamp.fromNow() + " by: " + versionEntry.deployer}</div>
                    {versionEntry.newDeployment ? newDeploymentLegend : null}
                </Tooltip>
            )
        }

        return (
            <OverlayTrigger placement="top" overlay={buildTooltip(cell)}>
                <Link to="log" query={this.createLinkQuery(cell)}>
                    {cell.version} {cell.newDeployment ? this.newDeploymentIcon() : null}
                </Link>
            </OverlayTrigger>
        );
    },

    createLinkQuery: function (cellContent) {
        return {environment: cellContent.environment, application: cellContent.application, regexp: true }
    },

    newDeploymentIcon: function () {
        return (
            <span>
                <i className="fa fa-star text-danger"></i>
            </span>
        );
    }
});
