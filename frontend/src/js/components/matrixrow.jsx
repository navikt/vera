var React = require('react');
var uuid = require('node-uuid');
var MatrixTableData = require('./matrixtabledata.jsx');

module.exports = MatrixRow = React.createClass({
    render: function(){
        return <tr>{this.props.rowObject.map(function(rowElem){
            return <MatrixTableData key={uuid.v1()} rowElem={rowElem}/>
        })}</tr>
    }
});
