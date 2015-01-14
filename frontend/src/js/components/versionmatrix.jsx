var React = require('react');
var util = require('../../vera-parser')
var $ = require('jquery');
var MatrixRow = require('./matrixrow.jsx');


module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {
            jsonData: [],
            headers: [],
            body: []
        }
    },

    updateMatrixData: function(headers, body) {
        this.setState({headers: headers, body: body})
    },

    componentDidMount: function () {
        $.getJSON('http://localhost:9080/cv').done(function (data) {
            this.state.jsonData = data;
            util.buildVersionMatrix(data, this.updateMatrixData);
        }.bind(this));
    },

    handleChange: function (e) {
            var applicationFilter = this.refs.applicationFilter.getDOMNode().value.toLowerCase();
            var environmentFilter = this.refs.environmentFilter.getDOMNode().value.toLowerCase();

            var filteredJsonData = this.state.jsonData.filter(function(versionEntry) {
                return versionEntry.application.toLowerCase().indexOf(applicationFilter) > -1 &&
                    versionEntry.environment.toLowerCase().indexOf(environmentFilter) > -1

            });
            util.buildVersionMatrix(filteredJsonData, this.updateMatrixData);
            e.preventDefault();
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
                        <input type="submit" className="btn btn-default" onClick={this.handleChange} value="Apply" />
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