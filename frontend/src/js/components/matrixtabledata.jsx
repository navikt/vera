var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;

        var newDeploymentIndicator = newDeployment() ? <i className="fa fa-flag"></i>: null;

        function newDeployment() {
            if (!rowElem || typeof rowElem == 'string') {
                return false;
            }
            return rowElem.newDeployment;
        }


        if (!rowElem){
            return <td>-</td>
        }
        if (typeof rowElem == 'string'){
            return <td><strong><Link to="log" query={{app: rowElem}}>{rowElem.toLowerCase()}</Link></strong></td>
        } else {
            return <td><Link to="log" query={{env: rowElem.environment, app: rowElem.application}}>{rowElem.version}</Link>{newDeploymentIndicator}</td>
        }
    }
});
