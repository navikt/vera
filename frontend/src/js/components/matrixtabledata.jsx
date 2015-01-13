var React = require('react');

module.exports = MatrixTableData = React.createClass({
    render: function () {
        var rowElem = this.props.rowElem;
        if (!rowElem){
            return <td>-</td>
        }
        if (typeof rowElem == 'string'){
            return <td>{rowElem}</td>
        } else {
            return <td>{rowElem.version}</td>
        }
    }
});
