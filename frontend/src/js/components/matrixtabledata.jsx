var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;

        var newDeploymentIcon = (
            <a title="Hehehe"><span><i className="fa fa-star text-danger"></i></span></a>
        )

        var newDeploymentIndicator = newDeployment() ? newDeploymentIcon : null;

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
            return <td><strong><Link to="log" query={{application: rowElem}}>{rowElem.toLowerCase()}</Link></strong></td>
        } else {
            return <td><Link to="log" query={{environment: rowElem.environment, application: rowElem.application}}>{rowElem.version}</Link> {newDeploymentIndicator}</td>
        }
    }
});
