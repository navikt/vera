var React = require('react');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var MatrixRow = require('./matrixrow.jsx');
var Router = require('react-router');


module.exports = VersionMatrix = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            jsonData: [],
            headers: [],
            body: [],
            appsFilter: "",
            envsFilter: ""
        }
    },

    updateMatrixData: function (headers, body) {
        this.setState({headers: headers, body: body})
    },

    componentDidMount: function () {
        var appsQueryParam = this.getQuery().apps;
        if (appsQueryParam) {
            this.setState({appsFilter: appsQueryParam});
        }

        var envsQueryParam = this.getQuery().envs;
        if (envsQueryParam) {
            this.setState({envsFilter: envsQueryParam});
        }

        $.getJSON('/cv').done(function (data) {
            this.setState({jsonData: data});

            var filteredJsonData = this.state.jsonData.filter(function (elem) {
                return this.isElementIn(this.state.appsFilter, elem, "application");
            }.bind(this)).filter(function (elem) {
                return this.isElementIn(this.state.envsFilter, elem, "environment");
            }.bind(this));

            util.buildVersionMatrix(filteredJsonData, this.updateMatrixData);
        }.bind(this));
    },

    isElementIn: function(filter, element, property){
            var filters = filter.split(",");
            for (var i = 0; i < filters.length; i++) {
                if (element[property].toLowerCase().indexOf(filters[i].trim()) > -1) {
                    return true;
                }
            }
            return false;
    },

    handleChange: function (e) {
        var applicationFilter = this.refs.applicationFilter.getDOMNode().value.toLowerCase();
        var environmentFilter = this.refs.environmentFilter.getDOMNode().value.toLowerCase();

        var filteredJsonData = this.state.jsonData.filter(function (elem) {
            return this.isElementIn(applicationFilter, elem, "application");
        }.bind(this)).filter(function (elem) {
            return this.isElementIn(environmentFilter, elem, "environment");
        }.bind(this));

        util.buildVersionMatrix(filteredJsonData, this.updateMatrixData);
        e.preventDefault();
    },

    clear: function (e) {
        this.refs.applicationFilter.getDOMNode().value = '';
        this.refs.environmentFilter.getDOMNode().value = '';

        util.buildVersionMatrix(this.state.jsonData, this.updateMatrixData);
    },

    render: function () {
        var headers = this.state.headers;
        var body = this.state.body;

        return (
            <div className="container-fluid">

                <div className="panel panel-default ">
                    <div className="panel-body">
                        <form id="myform" className="form-inline">
                            <div className="form-group">
                                <input ref="environmentFilter" type="text" className="form-control" placeholder="environments"></input>
                                <input ref="applicationFilter" type="text" className="form-control" placeholder="applications"></input>
                                <input type="submit" className="btn btn-default" onClick={this.handleChange} value="Apply" />
                                <input type="button" className="btn btn-danger" onClick={this.clear} value="Clear" />
                            </div>
                        </form>

                    </div>

                </div>

                <table ref="thematrix" className="table table-bordered table-striped">
                    <thead>
                        <tr>
                        {headers.map(function (header) {
                            return <th key={header}>{header.toUpperCase()}</th>
                        })}
                        </tr>
                    </thead>
                    <tbody>
                        {body.map(function (row) {
                            return <MatrixRow key={row[0]} rowObject={row}/>
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
});