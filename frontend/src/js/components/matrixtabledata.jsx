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
            return <td><Link to="firehose">{rowElem}</Link></td>
        } else {
            return <td><Link to="kvakk" query={{env: "t1", app: "bisys"}}>{rowElem.version}</Link></td>
        }
    }
});
