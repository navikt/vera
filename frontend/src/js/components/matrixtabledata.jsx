var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;

        var newDeploymentIcon = (
            <span><i className="fa fa-star text-danger"></i></span>
        )

        var newDeploymentIndicator = newDeployment() ? newDeploymentIcon : null;
        var newDeploymentTooltip = newDeployment() ? rowElem.application + " has been deployed to " + rowElem.environment +  " in the last 24 hrs" : "";

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
            return (
                <td>
                    <Link title={newDeploymentTooltip} to="log" query={{env: rowElem.environment, app: rowElem.application}}>
                    {rowElem.version} {newDeploymentIndicator}
                    </Link>
                </td>
            )
        }
    }
});
