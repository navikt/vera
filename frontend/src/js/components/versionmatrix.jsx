var React = require('react');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var MatrixRow = require('./matrixrow.jsx');
var Router = require('react-router');
var Link = Router.Link;


module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        var filters = {environmentClass: 't,q,p'}
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
            rowsToRender: 50,
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

    componentDidUpdate: function () {
        if (!this.state.loaded) {
            this.setState({loaded: true});
        }
    },

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

        if (this.refs.newDeployments.getDOMNode().checked) {
            filters.newDeployment = true;
        }

        var environmentClasses = [];
        if(this.refs.showU.getDOMNode().checked) {
            environmentClasses.push('u')
        }

        if(this.refs.showT.getDOMNode().checked) {
            environmentClasses.push('t')
        }

        if(this.refs.showQ.getDOMNode().checked) {
            environmentClasses.push('q')
        }

        if(this.refs.showP.getDOMNode().checked) {
            environmentClasses.push('p')
        }
        filters.environmentClass = environmentClasses.join(',');
        this.setState({filters: filters});

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


    viewAllRows: function () {
        this.setState({rowsToRender: null});
    },

    hasEnvClass: function (envClass) {
        return this.state.filters.environmentClass.indexOf(envClass) > -1
    },

    render: function () {
        var appFilter = this.state.filters.application;
        var envFilter = this.state.filters.environment;
        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        var body = filteredData.body;
        var showMoreLink;

        console.log('filters', this.state.filters);

        if(this.state.rowsToRender) {
            body = filteredData.body.slice(0, this.state.rowsToRender);

            if (this.state.rowsToRender && filteredData.body.length > this.state.rowsToRender) {
                showMoreLink = (
                    <div>
                        <button type="button" className="btn btn-link" onClick={this.viewAllRows}>View all...</button>
                    </div>
                )
            }
        }

        var cx = React.addons.classSet;
        var toggle24hrs = cx({
            "btn": true,
            "btn-toggle": true,
            "active": this.state.filters.newDeployment,
            "toggle-on": this.state.filters.newDeployment
        });

        var toggleU = cx({
            "btn": true,
            "btn-toggle": true,
            "active": this.hasEnvClass('u'),
            "toggle-on": this.hasEnvClass('u')
        });

        var toggleT = cx({
            "btn": true,
            "btn-toggle": true,
            "active": this.hasEnvClass('t'),
            "toggle-on": this.hasEnvClass('t')
        });

        var toggleQ = cx({
            "btn": true,
            "btn-toggle": true,
            "active": this.hasEnvClass('q'),
            "toggle-on": this.hasEnvClass('q')
        });

        var toggleP = cx({
            "btn": true,
            "btn-toggle": true,
            "active": this.hasEnvClass('p'),
            "toggle-on": this.hasEnvClass('p')
        });

        var spinnerClasses = cx({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
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
                                            <label htmlFor="appFilter">applications </label>&nbsp;
                                            <input id="appFilter" ref="applicationFilter" type="text" className="form-control input-sm"  defaultValue={appFilter}></input>
                                        </div>
                                    &nbsp;
                                        <div className="form-group">
                                            <label htmlFor="envFilter">environments </label>&nbsp;
                                            <input id="envFilter" ref="environmentFilter" type="text" className="form-control input-sm" active defaultValue={envFilter}></input>
                                        </div>
                                        <input type="submit" className="btn btn-default btn-sm" onClick={this.updateFilters} value="apply" />
                                        <input type="button" className="btn btn-danger btn-sm" onClick={this.clear} value="reset" />
                                    &nbsp;
                                    </div>
                                    <div className="btn-group pull-right" data-toggle="buttons" role="group">
                                        <label className={toggle24hrs} title="Show only applications deployed in the last 24 hrs">
                                            <input ref="newDeployments"  type="checkbox" autoComplete="off" onChange={this.updateFilters} checked={this.state.filters.newDeployment}/>
                                        last 24 hrs
                                        </label>
                                    <label className={toggleU} title="Show only developement environments">
                                     <input ref="showU" type="checkbox" autoComplete="off" onChange={this.updateFilters} checked={this.hasEnvClass('u')}/>
                                     u</label>
                                        <label className={toggleT} title="Show only test environments">
                                     <input ref="showT" type="checkbox" autoComplete="off" onChange={this.updateFilters} checked={this.hasEnvClass('t')}/>
                                     t
                                     </label>
                                        <label className={toggleQ} title="Show only Q environments">
                                     <input ref="showQ" type="checkbox" autoComplete="off" onChange={this.updateFilters} checked={this.hasEnvClass('q')}/>
                                     q
                                     </label>
                                        <label className={toggleP} title="Show only production">
                                     <input ref="showP" type="checkbox" autoComplete="off" onChange={this.updateFilters} checked={this.hasEnvClass('p')}/>
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
                {<div>
                 {showMoreLink}
                 <i className={spinnerClasses}></i>
                 </div>}
            </div >
        )
    }
});