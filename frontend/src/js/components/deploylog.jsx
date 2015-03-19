var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Router = require('react-router');
var LogRow = require('./logrow.jsx');
var LogHeader = require('./logheader.jsx')
var classString = require('react-classset');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            loaded: false,
            itemRenderCount: 50,
            isPolling: false,
            filters: this.enrichFromObject(this.emptyFilters, this.getQuery())
        };
    },

    componentDidMount: function () {
        this.getInitialDataFromBackend().success(this.getEverything);
    },




    render: function () {

        var filteredEvents = this.applyHeaderFilter(this.state.items, this.state.filters.regexp).filter(this.inactiveVersionsIfEnabled);
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);

        return (
            <div className="container">
                <h2>events
                    <small> {filteredEvents.length + "/" + this.state.items.length}
                        <i className={this.spinnerClasses()}></i>
                    </small>
                    <div className="pull-right btn-toolbar" data-toggle="buttons" role="group">
                        <button type="button"  className="btn btn-default btn-sm" onClick={this.clearFilters} >
                            <i className="fa fa-trash"></i>
                        &nbsp;
                        clear</button>
                        <label className={this.currentToggleButtonClasses(this.state.filters.onlyLatest)}>
                            <input type="checkbox" autoComplete="off" onClick={this.toggleOnlyLatest} />
                            <i className="fa fa-asterisk"></i>
                        &nbsp;
                        show only latest
                        </label>
                        <label className={this.regexpToggleButtonClasses()} title="Matcher strengene eksakt. F.eks 't1' matcher kun 't1', ikke 't10', 't11' osv. Støtter også regulære uttrykk.">
                            <input type="checkbox" autoComplete="off" onClick={this.toggleRegexpMode} />
                        eksakt match
                        </label>
                        <label className={this.currentToggleButtonClasses(this.state.isPolling)}>
                            <input type="checkbox" autoComplete="off" onClick={this.togglePolling} />
                            <i className={this.autoRefreshClasses()}></i>
                        &nbsp;
                        {this.autoRefreshBtnText()}
                        </label>
                    </div>
                </h2>

                <table className='table table-bordered table-striped'>
                    <tr>
                        <LogHeader columnName="application" regexp={this.state.filters.regexp} value={this.state.filters.application} changeHandler={this.handleChange} />
                        <LogHeader columnName="environment" regexp={this.state.filters.regexp} value={this.state.filters.environment} changeHandler={this.handleChange} />
                        <LogHeader columnName="deployer" regexp={this.state.filters.regexp} value={this.state.filters.deployer} changeHandler={this.handleChange} />
                        <LogHeader columnName="version" regexp={this.state.filters.regexp} value={this.state.filters.version} changeHandler={this.handleChange} />
                        <LogHeader columnName="timestamp" regexp={this.state.filters.regexp} value={this.state.filters.timestamp} changeHandler={this.handleChange} />
                    </tr>
                    <tbody>
                        {eventsToRender.map(function (elem) {
                            return <LogRow key={elem.id} event={elem} />
                        })}
                    </tbody>
                </table>
                <button type="button" className="btn btn-link" onClick={this.viewMoreResults}>View more results...</button>
            </div>
        )
    },

    emptyFilters: {
        application: '',
        environment: '',
        deployer: '',
        version: '',
        timestamp: '',
        onlyLatest: false,
        regexp: false
    },

    validBackendParams: ["application", "environment", "deployer", "version", "onlyLatest"],

    DEPLOYLOG_SERVICE: '/api/v1/deploylog',

    POLLING_INTERVAL_SECONDS: 90,


    applyHeaderFilter: function (items, regexpMode) {
        if (regexpMode) {
            return this.filterWithPreCompiledRegexp(items);
        } else {
            return items.filter(this.stringContainedIn);
        }
    },

    filterWithPreCompiledRegexp: function (items) {
        var compileValidRegEx = function(filterValue){
            var isValidRegex = function (expression) {
                try {
                    new RegExp("^" + expression + "$");
                    return true;
                } catch (e) {
                    return false;
                }
            }

            if (isValidRegex(filterValue)){
                return new RegExp("^" + (filterValue ? filterValue : ".*") + "$", "i");
            } else {
                return new RegExp("^$");
            }
        }

        var preCompiledRegexp = {
            "application": compileValidRegEx(this.state.filters["application"]),
            "environment": compileValidRegEx(this.state.filters["environment"]),
            "version": compileValidRegEx(this.state.filters["version"]),
            "deployer": compileValidRegEx(this.state.filters["deployer"]),
            "timestamp": compileValidRegEx(this.state.filters["timestamp"])
        }

        return items.filter(function (item) {
            return preCompiledRegexp["application"].test(item.application) &&
                preCompiledRegexp["environment"].test(item.environment) &&
                preCompiledRegexp["version"].test(item.version) &&
                preCompiledRegexp["deployer"].test(item.deployer) &&
                preCompiledRegexp["timestamp"].test(item.timestamp);
        }.bind(this));
    },

    stringContainedIn: function (elem) {
        return elem.application.toLowerCase().indexOf(this.state.filters.application.toLowerCase()) > -1
            && elem.environment.toLowerCase().indexOf(this.state.filters.environment.toLowerCase()) > -1
            && elem.deployer.toLowerCase().indexOf(this.state.filters.deployer.toLowerCase()) > -1
            && elem.version.toLowerCase().indexOf(this.state.filters.version.toLowerCase()) > -1
            && elem.deployed_timestamp.toString().toLowerCase().indexOf(this.state.filters.timestamp.toLowerCase()) > -1;
    },

    inactiveVersionsIfEnabled: function (elem) {
        if (!this.state.filters.onlyLatest) {
            return true;
        } else {
            return elem.replaced_timestamp === null;
        }
    },

    handleChange: function (e) {
        var filter = _.clone(this.state.filters, true);
        filter[e.target.id] = e.target.value;
        this.setState({filters: filter});
    },

    getInitialBackendParams: function () {
        var serialize = function (obj) {
            return '?' + Object.keys(obj).reduce(function (a, k) {
                    a.push(k + '=' + encodeURIComponent(obj[k]));
                    return a;
                }, []).join('&')
        };

        var extractFromObject = function (values, object) {
            return Object.keys(object).filter(function (val) {
                return values.indexOf(val) > -1;
            });
        };

        var urlContainsValidBackendParams = extractFromObject(this.validBackendParams, this.getQuery()).length > 0;
        if (urlContainsValidBackendParams) {
            var extractedValidParams = _.pick(this.getQuery(), this.validBackendParams);
            return serialize(extractedValidParams);
        } else {
            return '?last=1week';
        }
    },

    mapToViewFormat: function (data) {
        var toReadableDateFormat = function (eventItem) {
            eventItem.deployed_timestamp = moment(eventItem.deployed_timestamp).format("DD-MM-YY HH:mm:ss");
            return eventItem;
        }

        var nullVersionsToUndeployed = function (eventItem) {
            if (!eventItem.version) {
                eventItem.version = 'undeployed';
            }
            return eventItem;
        }

        return data.map(toReadableDateFormat).map(nullVersionsToUndeployed);
    },

    getInitialDataFromBackend: function () {
        return $.getJSON(this.DEPLOYLOG_SERVICE + this.getInitialBackendParams()).success(function (data) {
            this.setState({items: this.mapToViewFormat(data)})
        }.bind(this));
    },

    getEverything: function () {
        $.getJSON(this.DEPLOYLOG_SERVICE).done(function (data) {
            this.setState({
                items: this.mapToViewFormat(data),
                loaded: true
            })
        }.bind(this));
    },

    enrichFromObject: function (base, object) {
        var enrichedObject = {};
        Object.keys(base).forEach(function (key) {
            enrichedObject[key] = object[key] ? object[key] : '';
        });

        return enrichedObject;
    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
    },

    clearFilters: function () {
        this.setState({filters: _.clone(this.emptyFilters)});
    },

    toggleOnlyLatest: function () {
        var filter = _.clone(this.state.filters, true);
        filter['onlyLatest'] = !this.state.filters.onlyLatest;
        this.setState({filters: filter});
    },

    togglePolling: function () {
        var disablePolling = function () {
            clearInterval(this.interval);
            this.setState({isPolling: false});
        }.bind(this)

        var enablePolling = function () {
            this.interval = setInterval(this.tick, 1000);
            this.setState({secondsToNextPoll: this.POLLING_INTERVAL_SECONDS, isPolling: true});
        }.bind(this)

        this.state.isPolling ? disablePolling() : enablePolling();
    },

    tick: function () {
        var secondsToNextPoll = this.state.secondsToNextPoll;
        this.setState({secondsToNextPoll: secondsToNextPoll - 1})
        if (secondsToNextPoll < 1) {
            this.setState({secondsToNextPoll: this.POLLING_INTERVAL_SECONDS, loaded: false});
            this.getEverything();
        }
    },

    autoRefreshBtnText: function () {
        if (this.state.isPolling) {
            var nextPoll = this.state.secondsToNextPoll
            if (this.state.secondsToNextPoll < 10) {
                nextPoll = '0' + nextPoll;
            }
            return 'refreshing in ' + nextPoll;
        }
        return 'auto refresh'
    },

    autoRefreshClasses: function () {
        return classString({
            'fa': true,
            'fa-refresh': true,
            'fa-spin': this.state.isPolling
        })
    },

    toggleRegexpMode: function () {
        var filter = _.clone(this.state.filters, true);
        filter['regexp'] = !this.state.filters.regexp;
        this.setState({filters: filter});
    },

    spinnerClasses: function () {
        return classString({
            'fa': true,
            'fa-spinner': true,
            'fa-fw': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        })
    },

    currentToggleButtonClasses: function (isActive) {
        return classString({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            "active": isActive
        })
    },

    regexpToggleButtonClasses: function () {
        return classString({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            "active": this.state.filters.regexp
        })
    }
});