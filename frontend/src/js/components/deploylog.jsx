var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var State = require('react-router').State;
var Navigation = require('react-router').Navigation;
var LogRow = require('./logrow.jsx');
var LogHeader = require('./logheader.jsx')
var ToggleButton = require('./toggle-button.jsx');
var classString = require('react-classset');
var LastDeploymentDropdown = require('./last-deployment-dropdown.jsx');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;

module.exports = DeployLog = React.createClass({

    mixins: [State, Navigation],

    getInitialState: function () {

        return {
            items: [],
            loaded: false,
            itemRenderCount: 100,
            isPolling: false,
            deployEventTimeLimit: _.isEmpty(this.getQuery()) ? '1w' : '', // When query params, we came from matrix view and it makes sense to to set a time limit on backend call
            filters: this.enrichFromObject(this.getEmptyFilters(), this.getQuery())
        };
    },

    componentDidMount: function () {
        this.getDeployEvents();
    },

    componentDidUpdate: function(prevProps, prevState) {
        if(this.state.deployEventTimeLimit !== prevState.deployEventTimeLimit ||
                this.getQuery() != prevProps.query) {
            //Either query params has been cleared or timelimit param has changed. Time to call the backend again.
            this.getDeployEvents();
        }
    },

    setDeployEventTimeLimit: function(newLimit) {
        this.setState({loaded: false, deployEventTimeLimit: newLimit});
    },



    render: function () {
        console.log("Filters are in render");
        console.log(this.state.filters);
        console.log("State is in render");
        console.log(this.state);
        var filteredEvents = this.applyHeaderFilter(this.state.items, this.state.filters.regexp).filter(this.inactiveVersionsIfEnabled);
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);

        return (
            <div className="container">
                <h2>events
                    <small> {filteredEvents.length + "/" + this.state.items.length}
                        <i className={this.spinnerClasses()}></i>
                    </small>
                    <ButtonToolbar className="col col-lg pull-right">
                        <LastDeploymentDropdown onSelect={this.setDeployEventTimeLimit} selected={this.state.deployEventTimeLimit}/>

                        <ButtonGroup data-toggle="buttons">
                            <ToggleButton label='only latest' checked={this.state.filters.onlyLatest}
                                          onChange={this.toggleOnlyLatest} iconClassName={["fa fa-asterisk"]}/>
                        </ButtonGroup>
                        <ButtonGroup data-toggle="buttons">
                            <ToggleButton label='exact match' checked={this.state.filters.regexp}
                                          onChange={this.toggleRegexpMode}
                                          tooltip="matches search term exact. F.ex t1 matches only t1, not t10, t11 etc. supports regexp aswell"/>
                        </ButtonGroup>
                        <ButtonGroup data-toggle="buttons">
                            <ToggleButton label={this.autoRefreshBtnText()} checked={this.state.isPolling}
                                          onChange={this.togglePolling}
                                          iconClassName={[this.autoRefreshClasses()]}/>
                        </ButtonGroup>
                    </ButtonToolbar>
                </h2>

                <table className='table table-bordered table-striped'>
                    <tr>
                        <LogHeader columnName="application" regexp={this.state.filters.regexp}
                                   value={this.state.filters.application} changeHandler={this.handleChange}/>
                        <LogHeader columnName="environment" regexp={this.state.filters.regexp}
                                   value={this.state.filters.environment} changeHandler={this.handleChange}/>
                        <LogHeader columnName="deployer" regexp={this.state.filters.regexp}
                                   value={this.state.filters.deployer} changeHandler={this.handleChange}/>
                        <LogHeader columnName="version" regexp={this.state.filters.regexp}
                                   value={this.state.filters.version} changeHandler={this.handleChange}/>
                        <LogHeader columnName="timestamp" regexp={this.state.filters.regexp}
                                   value={this.state.filters.timestamp} changeHandler={this.handleChange}>
                        </LogHeader>
                        <th>
                            <Button bsSize="small" onClick={this.clearFilters}>
                                <i className="fa fa-trash"></i>
                                &nbsp;
                                clear all filters
                            </Button>
                        </th>
                    </tr>
                    <tbody>
                    {eventsToRender.map(function (elem) {
                        return <LogRow key={elem.id} event={elem}/>
                    })}
                    </tbody>
                </table>
                {this.createShowMoreButtonWhenTooManyResults()}

            </div>
        )
    },

    createShowMoreButtonWhenTooManyResults: function(renderedEvents) {
      if(this.state.items.length > this.state.itemRenderCount) {
          return (<Button bsStyle="link" onClick={this.viewMoreResults}>View more results...</Button>)
      }
    },

    getEmptyFilters: function() {
        var emptyFilters = {
            application: '',
            environment: '',
            deployer: '',
            version: '',
            timestamp: '',
            onlyLatest: false,
            regexp: false
        }

        return _.clone(emptyFilters);
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
        var compileValidRegEx = function (filterValue) {
            var isValidRegex = function (expression) {
                try {
                    new RegExp("^" + expression + "$");
                    return true;
                } catch (e) {
                    return false;
                }
            }

            if (isValidRegex(filterValue)) {
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
                preCompiledRegexp["timestamp"].test(item.deployed_timestamp);
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

    getBackendParams: function () {
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

        var params = {};
        var urlContainsValidBackendParams = extractFromObject(this.validBackendParams, this.getQuery()).length > 0;

        if (urlContainsValidBackendParams) {
            params = _.pick(this.getQuery(), this.validBackendParams);
        }
        else {
            // When only set last param when no query params otherwise it looks wierd when you clik on something in the matrix view and get an empty log...
            params.last = this.state.deployEventTimeLimit;
        }

        return  serialize(params) ;
    },

    mapToViewFormat: function (data) {
        var toReadableDateFormat = function (eventItem) {
            eventItem.original_timestamp = eventItem.deployed_timestamp;
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

    getDeployEvents: function () {
        return $.getJSON(this.DEPLOYLOG_SERVICE + this.getBackendParams()).success(function (data) {
            this.setState({loaded: true, items: this.mapToViewFormat(data)})
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
        this.setState({itemRenderCount: this.state.itemRenderCount + 100})
    },

    clearFilters: function () {
        console.log("Clearing filters");
        console.log(this.getEmptyFilters());
            this.setState({deployEventTimeLimit: '1w', filters: this.getEmptyFilters()});
            this.replaceWith('log');
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
            this.getDeployEvents();
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
        return "fa fa-refresh".concat((this.state.isPolling) ? " fa-spin" : "");
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
    }
});