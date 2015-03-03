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
            return <td className="text-nowrap"><strong><Link to="log" query={{application: rowElem}}>{rowElem.toLowerCase()}</Link></strong></td>
        } else {
            return (
                <td className="text-nowrap">
                    <Link title={newDeploymentTooltip} to="log" query={{environment: rowElem.environment, application: rowElem.application}}>
                    {rowElem.version} {newDeploymentIndicator}
                    </Link>
                </td>
            )
        }
    }
});
