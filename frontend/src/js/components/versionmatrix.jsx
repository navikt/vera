var React = require('react');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var _ = require('lodash');
var MatrixRow = require('./matrixrow.jsx');


module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {
            jsonData: [],
            filters: {}
        }
    },

    componentDidMount: function () {
        $.getJSON('http://localhost:9080/cv').done(function (data) {
            this.setState({jsonData: data});
        }.bind(this));
    },


    updateFilters: function (e) {
        var newState  = {};
        newState.application = this.refs.applicationFilter.getDOMNode().value.toLowerCase();
        newState.environment = this.refs.environmentFilter.getDOMNode().value.toLowerCase();

        if(this.refs.newDeployments.getDOMNode().checked) {
            newState.newDeployment = true;
        }

        this.setState({filters: newState});
        console.dir('Filers are: ', this.state.filters);
        if(e.target.type === 'submit') {
            console.log('Preventing default')
            e.preventDefault();
        }

    },

    //updateToggleFilters: function(e) {
    //    console.log("toggle ")
    //    console.log("kukk2", e.target.type)
    //    console.log(this.refs.newDeployments.getDOMNode().checked);
    //
    //    this.setState({
    //        filters: {
    //            newDeployments: this.refs.newDeployments.getDOMNode().checked
    //        }
    //    });
    //},

    applyFilters: function () {
        var filters = this.state.filters;

        var isElementIn = function (filterString, element, property) {
            var filterTokens = filterString.split(",");
            for (var i = 0; i < filterTokens.length; i++) {
                if (element[property].toLowerCase().indexOf(filterTokens[i].trim()) > -1) {
                    return true;
                }
            }
            return false;
        }

        var applyFilter = function(inputData, filterString, filterProperty) {
            if (typeof filterString === 'boolean' ) {
                return filteredJsonData.filter(function(elem){
                   return elem[filterProperty] === true;
                });

            }
            else {
            return filteredJsonData.filter(function (elem) {
                return isElementIn(filters[filterProperty], elem, filterProperty);
            });
        }
        }

        var filteredJsonData = this.state.jsonData;

        if (filters) {
            var keys = Object.keys(filters);
            keys.forEach(function (filterProperty) {
                filteredJsonData = applyFilter(filteredJsonData, filters[filterProperty], filterProperty);
            });
        }

        return util.buildVersionMatrix(filteredJsonData);
    },

    clear: function (e) {
        this.refs.applicationFilter.getDOMNode().value = '';
        this.refs.applicationFilter.getDOMNode().value = '';
        currentFilters = this.state.filters;
        delete currentFilters.application;
        delete currentFilters.environment;
        this.setState({filters: currentFilters});
    },

    //newDeployments: function (e) {
    //
    //    console.log(this.refs.bauer.getDOMNode().checked);
    //    console.log(this.refs.bauer);
    //
    //    this.setState({newDeploymentsFilter: this.refs.bauer.getDOMNode().checked});
    //    //this.refs.bauer.getDomNode().className= (this.refs.bauer.getDOMNode().checked) ? "btn btn-default active" : "btn btn-default";
    //    //var filteredData = this.state.jsonData.filter(function (elem) {
    //    //    return elem.newDeployment;
    //    //});
    //
    //    //util.buildVersionMatrix(filteredData, this.updateMatrixData)
    //},

    render: function () {
        console.log("This is filters in Render ", this.state.filters)
        var filteredData = this.applyFilters();

        var headers = filteredData.header;
        var body = filteredData.body;

        var cx = React.addons.classSet;
        var toggle = cx({
            "btn": true,
            "btn-default": true,
            "active": this.state.filters.newDeployment

        });

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        <div className="form-group">
                                            <input ref="applicationFilter" type="text" className="form-control" active placeholder="applications"></input>
                                        </div>
                                        <div className="form-group">
                                            <input ref="environmentFilter" type="text" className="form-control" placeholder="environments"></input>
                                        </div>
                                        <input type="submit" className="btn btn-default" onClick={this.updateFilters} value="Apply" />
                                        <input type="button" className="btn btn-danger" onClick={this.clear} value="Clear" />
                                    </div>
                                    <div className="btn-group pull-right" data-toggle="buttons" role="group">
                                        <label className={toggle} >
                                            <input ref="newDeployments" type="checkbox" autoComplete="off" onClick={this.updateFilters} />
                                        last 24 hrs
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        u</label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        t
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        q
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        p
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <table ref = "thematrix" className = "table table-bordered table-striped">
                    <thead>
                        <tr>
                        {headers.map(function (header) {
                            return <th key={header}>{header.toUpperCase()}</th>
                        })}
                        </tr>
                    </thead>
                    < tbody >
                        {body.map(function (row) {
                            return <MatrixRow key={row[0]} rowObject={row}/>
                        })
                            }
                    </tbody>
                </table>
            </div >
        )
    }
});