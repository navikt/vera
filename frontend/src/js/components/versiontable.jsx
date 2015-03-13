var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = VersionTable = React.createClass({

    getInitialState: function () {
        return {rowsToRender: 50};
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.tableBody.length !== this.props.tableBody.length ||
            this.state.rowsToRender !== nextState.rowsToRender ||
            nextProps.tableHeader.length !== this.props.tableHeader.length
    },

    render: function () {
        var showMoreLink;
        var viewAllRows = function () {
            this.setState({rowsToRender: this.props.tableBody.length});
        }.bind(this)

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
                        {this.props.tableHeader.map(function (header) {
                            return <th key={header}>{header.toUpperCase()}</th>
                        })}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyToRender.map(this.buildTableRow)}
                    </tbody>
                </table>
                <div>
                 {showMoreLink}
                </div>
            </div>
        )
    },

    buildTableRow: function (row) {
        return (<tr>{row.map(function (cell) {
                return (<td className='text-nowrap'>{this.cellContent(cell)}</td>)
            }.bind(this)
        )}</tr>)
    },


    cellContent: function (cell) {
        if (!cell) {
            return '-';
        }

        var newDeployment = this.newDeployment(cell);
        var tooltip = newDeployment ? cell.application + " has been deployed to " + cell.environment + " in the last 24 hrs" : "";
        return (
            <Link to="log" query={this.createLinkQuery(cell)} title={tooltip}>
            {this.createLinkContent(cell)} {newDeployment ? this.newDeploymentIcon() : null}
            </Link>
            );
    },

    createLinkQuery: function(cellContent) {
        if(typeof cellContent === 'string') {
            return {application: cellContent};
        }
        return {environment: cellContent.environment, application: cellContent.application}
    },

    createLinkContent: function(cellContent) {
        if(typeof cellContent === 'string') {
            return cellContent;
        }
        return cellContent.version  ;
    },

    newDeployment: function (rowElem) {
        if (!rowElem || typeof rowElem == 'string') {
            return false;
        }
        return rowElem.newDeployment;
    },

    newDeploymentIcon: function() {
        return(
            <span>
                <i className="fa fa-star text-danger"></i>
            </span>
        );
    }

});
