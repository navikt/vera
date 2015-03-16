var $ = jQuery = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var React = require('react/addons');
var Router = require('react-router');
var classString = require('react-classset');
var Link = Router.Link;
var util = require('../../vera-parser');
var VersionTable = require('./versiontable.jsx');

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
            jsonData: [],
            filters: filters
        }
    },

    mixins: [Router.State],

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.jsonData.length > 0;
    },

    componentDidMount: function () {
        $.getJSON('/api/v1/deploylog?onlyLatest=true&filterUndeployed=true').done(function (data) {
            var enrichedLogEvents = _.map(data, function (logEvent) {
                if (isDeployedLast24Hrs(logEvent)) {
                    var enrichedObject = _.clone(logEvent)
                    enrichedObject.newDeployment = true;
                    return enrichedObject;
                }
                return logEvent;
            });
            this.setState({jsonData: enrichedLogEvents});
        }.bind(this));

        var isDeployedLast24Hrs = function (logEvent) {
            return moment(logEvent.deployed_timestamp).isAfter(moment().subtract(24, 'hours'));
        };
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
        if (this.refs.showU.getDOMNode().checked) {
            environmentClasses.push('u')
        }

        if (this.refs.showT.getDOMNode().checked) {
            environmentClasses.push('t')
        }

        if (this.refs.showQ.getDOMNode().checked) {
            environmentClasses.push('q')
        }

        if (this.refs.showP.getDOMNode().checked) {
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


    hasEnvClass: function (envClass) {
        return this.state.filters.environmentClass.indexOf(envClass) > -1
    },

    render: function () {
        var appFilter = this.state.filters.application;
        var envFilter = this.state.filters.environment;
        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        var body = filteredData.body;

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        {this.createInputFilter('applications', 'applicationFilter', appFilter)}&nbsp;
                                        {this.createInputFilter('environments', 'environmentFilter', envFilter)}
                                        <button type="submit" className="btn btn-default btn-sm" onClick={this.updateFilters}>
                                            <i className="fa fa-filter"></i>
                                        &nbsp;
                                        apply
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={this.clear}>
                                            <i className="fa fa-trash"></i>
                                        &nbsp;reset
                                        </button>
                                    </div>
                                    <div className="btn-group pull-right" data-toggle="buttons" role="group">
                                        {this.createToggleButton('show only applications deployed in the last 24 hrs',
                                            'newDeployments', 'last 24 hrs', this.state.filters.newDeployment)}
                                        {this.createToggleButton('show only developement environments', 'showU', 'u', this.hasEnvClass('u'))}
                                        {this.createToggleButton('show only test environments', 'showT', 't', this.hasEnvClass('t'))}
                                        {this.createToggleButton('show only Q environments', 'showQ', 'q', this.hasEnvClass('q'))}
                                        {this.createToggleButton('show only production', 'showP', 'p', this.hasEnvClass('p'))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <VersionTable key="tablekey" tableHeader={headers} tableBody={body} />
                {<h3>
                    <i className={this.spinnerClasses()}></i>
                </h3>}
            </div >
        )
    },

    createInputFilter: function (labelText, inputId, defaultValue) {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">{labelText}</div>
                    <input ref={inputId} type="text" className="form-control input-sm"  defaultValue={defaultValue}></input>
                </div>
            </div>
        )
    },

    createToggleButton: function (tooltipText, inputId, buttonLabel, isChecked) {
        return (
            <label className={this.toggleBtnClasses(isChecked)} title={tooltipText}>
                <input ref={inputId}  type="checkbox" autoComplete="off"onChange={this.updateFilters} checked={isChecked}/>
          {buttonLabel}
            </label>
        )
    },

    toggleBtnClasses: function (isToggled) {
        return classString({
            'btn': true,
            'btn-toggle': true,
            'btn-sm': true,
            'toggle-on': isToggled
        })
    },

    spinnerClasses: function () {
        return classString({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        })
    }
});