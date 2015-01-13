var React = require('react');
var util = require('../../vera-parser')
var $ = require('jquery');
var MatrixRow = require('./matrixrow.jsx');

module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {headers: [], body: []}
    },

    componentDidMount: function () {
        $.getJSON('http://localhost:9080/cv').done(function (data) {
            util.buildVersionMatrix(data, function (headers, body) {
                this.setState({headers: headers, body: body});
            }.bind(this));
        }.bind(this));
    },

    render: function () {
        var headers = this.state.headers;
        var body = this.state.body;

        return <table className='table table-striped'>
            <tr>
            {headers.map(function(header){
                return <th key={header}>{header}</th>
            })}
            </tr>
            <tbody>
            {body.map(function(row){
                return <MatrixRow key={row[0]} rowObject={row} />
            })}
            </tbody>
        </table>
    }
});