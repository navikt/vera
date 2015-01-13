var React = require('react');
var util = require('../../vera-parser')
var $ = require('jquery');

module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {headers: [], body: []}
    },

    componentDidMount: function () {
        $.getJSON('http://localhost:9080/cv').done(function (data) {
            //this.setState({items: data})
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
            {headers.map(function(header){return <th>{header}</th>})}
            </tr>
            <tbody>
            {body.map(function(row){
                return <tr>{row.map(function(rowelem){
                    if (!rowelem){
                        return <td>-</td>
                    }
                    if (typeof rowelem == 'string'){
                        return <td>{rowelem}</td>
                    }
                    else {
                        return <td>{rowelem.version}</td>
                    }
                })}</tr>
            })}
            </tbody>
        </table>
    }
});