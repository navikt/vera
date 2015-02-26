var React = require('react');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var MatrixRow = require('./matrixrow.jsx');
var Router = require('react-router');
var Link = Router.Link;
var classString = require('react-classset');


module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        var filters = {}
        var appsQueryParam = this.getQuery().apps;

        if (appsQueryParam) {
            filters.application = appsQueryParam;
        }
        var envsQueryParam = this.getQuery().envs;
        if (envsQueryParam) {
            filters.environment = envsQueryParam;
        }

        return {
            loaded: false,
            rowsToRender: 20,
            jsonData: [],
            filters: filters
        }
    },

    mixins: [Router.State],

    componentDidMount: function () {
        $.getJSON('/cv').done(function (data) {
            this.setState({jsonData: data});
        }.bind(this));
    },

    componentWillUpdate: function () {
        var filters = this.state.filters;
        var appsQueryParam = this.getQuery().apps;
        delete filters.application;
        delete filters.environment;

        if (appsQueryParam) {
            filters.application = appsQueryParam;
        }
        var envsQueryParam = this.getQuery().envs;
        if (envsQueryParam) {
            filters.environment = envsQueryParam;
        }
    },

    //componentDidUpdate: function () {
    //    //console.log('Hitting')
    //    if (!this.state.loaded) {
    //        console.log('Stop spinning');
    //        this.setState({loaded: true});
    //    }
    //},

    updateFilters: function (e) {
        var filters = {};

        var appFilter = this.refs.applicationFilter.getDOMNode().value.toLowerCase();
        var envFilter = this.refs.environmentFilter.getDOMNode().value.toLowerCase();
        if (appFilter) {
            filters.application = appFilter;
        }

        if (envFilter) {
            filters.environment = envFilter;
        }


        //if (this.refs.newDeployments.getDOMNode().checked) {
        //    filters.newDeployment = true;
        //}

        this.setState({filters: filters});

        e.preventDefault();

        if (e.target.type === 'submit') { // prevent form submission, no need to call the server as everything happens client side
            e.preventDefault();
        }

        window.location.href = "#/matrix?envs=" + envFilter + "&apps=" + appFilter;
    },

    applyFilters: function () {
        var filters = this.state.filters;

        var isElementIn = function (filterString, element, property) {
            var filterTokens = filterString.split(",");
            var match = false;
            for (var i = 0; i < filterTokens.length; i++) {
                var filterPattern = new RegExp('\\b' + filterTokens[i].trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b');
                if (element[property].toLocaleLowerCase().search(filterPattern) > -1) {
                    match = true;
                }
            }
            return match;
        }

        var applyFilter = function (inputData, filterString, filterProperty) {
            if (typeof filterString === 'boolean') {
                return inputData.filter(function (elem) {
                    return elem[filterProperty] === true;
                });

            }
            else {
                return inputData.filter(function (elem) {
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
        this.refs.environmentFilter.getDOMNode().value = '';
        this.refs.applicationFilter.getDOMNode().value = '';
        var currentFilters = this.state.filters;
        delete currentFilters.application;
        delete currentFilters.environment;
        //this.setState({filters: currentFilters});
        window.location.href = "#/matrix";
    },


    //viewAllRows: function () {
    //    this.setState({loaded: false})
    //
    //    //console.log('Should trigger a rerender... '  + util.countRows(this.state.jsonData))
    //    //this.setState({rowsToRender: rowCount})
    //    //console.log('Reloading...')
    //},

    toggle: function(){
        return classSet({
            "btn": true,
            "btn-default": true,
            "active": this.state.filters.newDeployment
        });
    },

    render: function () {
        var appFilter = this.state.filters.application;
        var envFilter = this.state.filters.environment;

        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        //var body = filteredData.body.slice(0, this.state.rowsToRender);
        var body = filteredData.body;

        //var spinnerClasses = cx({
        //    'fa': true,
        //    'fa-spinner': true,
        //    'fa-spin': true,
        //    'hidden': this.state.loaded
        //});

        //var showMoreLink;

        //if (this.state.rowsToRender < filteredData.body.length) {
        //    showMoreLink = (
        //        <div>
        //            <button type="button" className="btn btn-link" onClick={this.viewAllRows()}>View all...</button>
        //        </div>
        //    )
        //}
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        <div className="form-group">
                                            <label htmlFor="envFilter">environments </label>&nbsp;
                                            <input id="envFilter" ref="environmentFilter" type="text" className="form-control input-sm" active defaultValue={envFilter}></input>
                                        </div>
                                    &nbsp;
                                        <div className="form-group">
                                            <label htmlFor="appFilter">applications </label>&nbsp;
                                            <input id="appFilter" ref="applicationFilter" type="text" className="form-control input-sm"  defaultValue={appFilter}></input>
                                        </div>
                                        <input type="submit" className="btn btn-default btn-sm" onClick={this.updateFilters} value="apply" />
                                        <input type="button" className="btn btn-danger btn-sm" onClick={this.clear} value="clear" />
                                    &nbsp;
                                    </div>
                                    {/*<div className="btn-group pull-right" data-toggle="buttons" role="group">
                                        <label className={this.toggle()} >
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
                                    </div>*/}
                                </div>
                            </form>
                        </div>
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
                    < tbody >
                        {body.map(function (row) {
                            return <MatrixRow key={row[0]} rowObject={row}/>
                        })
                            }
                    </tbody>
                </table>
                {/*<div>
                 {showMoreLink}
                 <i className={spinnerClasses}></i>
                 </div>*/}
            </div >
        )
    }
});