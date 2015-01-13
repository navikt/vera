var React = require('react');
var util = require('../../vera-parser')
var $ = require('jquery');
var MatrixRow = require('./matrixrow.jsx');

module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {
            headers: [],
            body: [],
            applicationFilter: '',
            environmentFilter: ''
        }
    },

    componentDidMount: function () {
        $.getJSON('http://localhost:9080/cv').done(function (data) {
            util.buildVersionMatrix(data, function (headers, body) {
                this.setState({headers: headers, body: body});
            }.bind(this));
        }.bind(this));
    },

    handleChange: function (e) {
        this.setState({
            applicationFilter: this.refs.applicationFilter.getDOMNode().value,
            environmentFilter: this.refs.environmentFilter.getDOMNode().value
        }, function(){
            this.refs.applicationFilter.getDOMNode().value = "";
            this.refs.environmentFilter.getDOMNode().value = "";
        });
    },

    render: function () {
        var headers = this.state.headers;
        var body = this.state.body;
        return (
            <div className="container-fluid">
                <form id="myform" className="form-inline">
                    <div className="form-group">
                        <input ref="applicationFilter" type="text" className="form-control" placeholder="Applications filter..."></input>
                        <input ref="environmentFilter" type="text" className="form-control" placeholder="Environments filter..."></input>
                        <button className="btn btn-default" type="button" onClick={this.handleChange}>Apply</button>
                    </div>
                </form>

                <table className="table table-striped">
                    <tr>
                    {headers.map(function (header) {
                        return <th key={header}>{header}</th>
                    })}
                    </tr>
                    <tbody>
                    {body.map(function (row) {
                        return <MatrixRow key={row[0]} rowObject={row} />
                    })}
                    </tbody>
                </table>
            </div>
        )
    }


});