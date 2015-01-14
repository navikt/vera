var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;
        if (!rowElem){
            return <td>-</td>
        }
        if (typeof rowElem == 'string'){
            return <td><Link to="firehose" query={{app: rowElem}}>{rowElem}</Link></td>
        } else {
            return <td><Link to="firehose" query={{env: rowElem.environment, app: rowElem.application}}>{rowElem.version}</Link></td>
        }
    }
});
