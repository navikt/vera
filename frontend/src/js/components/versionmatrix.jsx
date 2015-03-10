var React = require('react/addons');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var TheTable = require('./thetable.jsx');
var Router = require('react-router');
var Link = Router.Link;

var prerest;
var start;
var stop;
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
        if (nextState.jsonData.length > 0) {
            console.log('will fucking render ');
            return true;
        }
        else {
            console.log('no need to fucking render');
            return false;
        }
        ;
    },

    componentDidMount: function () {
        prerest = new Date();

        $.getJSON('/api/v1/deploylog?onlyLatest=true').done(function (data) {
            var enrichedLogEvents = _.map(data, function (logEvent) {
                if (isDeployedLast24Hrs(logEvent)) {
                    var enrichedObject = _.clone(logEvent)
                    enrichedObject.newDeployment = true;
                    return enrichedObject;
                }
                return logEvent;
            });
            console.log('Redy to render')
            start = new Date();
            //React.addons.Perf.start();
            this.setState({jsonData: enrichedLogEvents});

            //console.log((stop-start)/1000.0);
            //React.addons.Perf.stop();
            //React.addons.Perf.printInclusive()
            //React.addons.Perf.printExclusive()
            //React.addons.Perf.printWasted()
            //React.addons.Perf.printDOM()
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
        console.log('done');
        stop = new Date();
        console.log('Took with rest ', (stop - prerest) / 1000.0);
        console.log('Took ', (stop - start) / 1000.0);
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
        var starPA = new Date();
        var tempi = util.buildVersionMatrix(filteredJsonData)
        var stopPA = new Date();
        console.log('parsertime', (stopPA - starPA) / 1000.0)
        return tempi;
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
        console.log('Rendering', this.state)
        var appFilter = this.state.filters.application;
        var envFilter = this.state.filters.environment;
        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        var body = filteredData.body;

        var cx = React.addons.classSet;
        var toggle24hrs = cx({
            "btn": true,
            "btn-toggle": true,
            "btn-sm": true,
            "toggle-on": this.state.filters.newDeployment
        });

        var toggleU = cx({
            "btn": true,
            "btn-toggle": true,
            "btn-sm": true,
            "toggle-on": this.hasEnvClass('u')
        });

        var toggleT = cx({
            "btn": true,
            "btn-toggle": true,
            "btn-sm": true,
            "toggle-on": this.hasEnvClass('t')
        });

        var toggleQ = cx({
            "btn": true,
            "btn-toggle": true,
            "btn-sm": true,
            "toggle-on": this.hasEnvClass('q')
        });

        var toggleP = cx({
            "btn": true,
            "btn-toggle": true,
            "btn-sm": true,
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
                                        {this.createToggleButton('Show only applications deployed in the last 24 hrs', toggle24hrs, 'newDeployments', 'last 24 hrs', this.state.filters.newDeployment)}
                                        {this.createToggleButton('Show only developement environments', toggleU, 'showU', 'u', this.hasEnvClass('u'))}
                                        {this.createToggleButton('Show only test environments', toggleT, 'showT', 't', this.hasEnvClass('t'))}
                                        {this.createToggleButton('Show only Q environments', toggleQ, 'showQ', 'q', this.hasEnvClass('q'))}
                                        {this.createToggleButton('Show only production', toggleP, 'showP', 'p', this.hasEnvClass('p'))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <TheTable key="tablekey" tableHeader={headers} tableBody={body} />
                {<h3>
                    <i className={spinnerClasses}></i>
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

    createToggleButton: function (tooltipText, cssClassNames, inputId, buttonLabel, isChecked) {
        return (
            <label className={cssClassNames} title={tooltipText}>
                <input ref={inputId}  type="checkbox" autoComplete="off"onChange={this.updateFilters} checked={isChecked}/>
          {buttonLabel}
            </label>
        )
    }
});