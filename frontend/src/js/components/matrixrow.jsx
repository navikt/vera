var React = require('react');
var MatrixTableData = require('./matrixtabledata.jsx');

module.exports = MatrixRow = React.createClass({
    render: function(){
        return <tr>{this.props.rowObject.map(function(rowElem){
            return <MatrixTableData rowElem={rowElem} />
        })}</tr>
    }
});
