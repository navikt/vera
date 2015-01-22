var React = require('react');
var Router = require('react-router');
var moment = require('moment');
var Link = Router.Link;

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;

        var newDeploymentIndicator = newDeployment() ? <i className="fa fa-flag"></i>: null;

        function newDeployment() {
            //
            if (!rowElem || typeof rowElem == 'string') {
                return false;
            }
            return rowElem.newDeployment;
        }
        //
        //    var deployTime = moment(rowElem.deployTime);
        //    var nowMinus24Hrs = moment().subtract(24, 'hours');
        //
        //    return deployTime.isAfter(nowMinus24Hrs);
        //}

        if (!rowElem) {
            return <td>-</td>
        }
        if (typeof rowElem == 'string') {
            return <td>
                <strong>
                    <Link to="firehose" query={{app: rowElem}}>{rowElem.toLowerCase()}</Link>
                </strong>
            </td>
        } else {
            return (
                <td>
                    <Link to="firehose" query={{
                        env: rowElem.environment,
                        app: rowElem.application
                    }}>{rowElem.version}</Link> {newDeploymentIndicator}
                </td>
            )
        }
    }
});
