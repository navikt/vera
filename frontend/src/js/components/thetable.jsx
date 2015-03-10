var React = require('react');
var Router = require('react-router');
var classString = require('react-classset');
var Link = Router.Link;

module.exports = TheTable = React.createClass({

    getInitialState: function () {
        return {rowsToRender: 50};
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return nextProps.tableBody.length !== this.props.tableBody.length ||
            this.state.rowsToRender !== nextState.rowsToRender ||
            nextProps.tableHeader.length !== this.props.tableHeader.length
    },

    render: function () {
        console.log('rendering  matrix', this.state);
        var showMoreLink;

        var newDeployment = function (rowElem) {
            if (!rowElem || typeof rowElem == 'string') {
                return false;
            }
            return rowElem.newDeployment;
        }

         var newDeploymentIcon = (
            <span>
                <i className="fa fa-star text-danger"></i>
            </span>
        )

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
                        {bodyToRender.map(function (row) {
                            return (
                                <tr>{row.map(function (rowElem) {
                                    var newDeploymentIndicator = newDeployment(rowElem) ? newDeploymentIcon : null;
                                    var newDeploymentTooltip = newDeployment(rowElem) ? rowElem.application + " has been deployed to " + rowElem.environment + " in the last 24 hrs" : "";

                                    if (!rowElem) {
                                        return <td>-</td>
                                    }
                                    if (typeof rowElem == 'string') {
                                        return <td className="text-nowrap">
                                            <strong>
                                                <Link to="log" query={{application: rowElem}}>{rowElem.toLowerCase()}</Link>
                                            </strong>
                                        </td>
                                    } else {
                                        return (
                                            <td className="text-nowrap">
                                                <Link title={newDeploymentTooltip} to="log" query={{
                                                    environment: rowElem.environment,
                                                    application: rowElem.application
                                                }}>
                                                    {rowElem.version}  {newDeploymentIndicator}

                                                </Link>
                                            </td>
                                        )
                                    }
                                })}
                                </tr>)
                        })
                            }
                    </tbody>
                </table>
                <div>
                 {showMoreLink}
                </div>
            </div>
        )
    }
});
