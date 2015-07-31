var $ = jQuery = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var React = require('react');
var State = require('react-router').State;
var Navigation = require('react-router').Navigation;
var Link = require('react-router').Link;
var classString = require('react-classset');
var util = require('../vera-parser');
var VersionTable = require('./versiontable.jsx');
var LastDeploymentDropdown = require('./last-deployment-dropdown.jsx');
var ToggleButtonGroup = require('./toggle-button-group.jsx');
var ToggleButton = require('./toggle-button.jsx');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var FormGroup = require('react-bootstrap').FormGroup;
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;

module.exports = VersionMatrix = React.createClass({

    defaultFilter: {environmentClass: ['t', 'q', 'p']},

    getInitialState: function () {
        var filters = _.clone(this.defaultFilter);
        var lastDeployedFilter = '';

        var apps = this.getQueryParam('apps');
        var envs = this.getQueryParam('envs');

        filters.application = apps.split(',');
        filters.environment = envs.split(',');

        return {
            applicationInput: apps,
            environmentInput: envs,
            loaded: false,
            jsonData: [],
            filters: filters,
            lastDeployedFilter: lastDeployedFilter
        }
    },

    mixins: [State, Navigation],

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.jsonData.length > 0;
    },


    componentWillMount: function() {
        $.getJSON('/api/v1/deploylog?onlyLatest=true&filterUndeployed=true').done(function (data) {

            var enrichedLogEvents = _.map(data, function (logEvent) {
                logEvent.momentTimestamp = moment(logEvent.deployed_timestamp);
                if (isDeployedLast24Hrs(logEvent, moment().subtract(24, 'hours'))) {
                    logEvent.newDeployment = true;
                    return logEvent;
                }

                return logEvent;
            });
            this.setState({jsonData: enrichedLogEvents, loaded: true});

        }.bind(this));

        var isDeployedLast24Hrs = function (logEvent, deployDateBackInTime) {
            return logEvent.momentTimestamp.isAfter(deployDateBackInTime);
        };
    },

    componentDidUpdate: function(nextProps, nextState) {
        console.log("CDU");
    },

    //componentDidMount: function () {
    //
    //},

    getQueryParam: function (paramName) {
        var queryParam = this.getQuery()[paramName];
        return queryParam || '';
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.getQuery() != nextProps.query) {
            var filters = _.clone(this.state.filters)
            var apps = this.getQueryParam('apps');
            var envs = this.getQueryParam('envs');
            filters.application = apps.split(',');
            filters.environment = envs.split(',');
            this.setState({filters: filters, applicationInput: apps, environmentInput: envs})
        }
    },

    setEnvironmentClassFilters: function() {
        var currentFilters = _.clone(this.state.filters);
        currentFilters.environmentClass = this.refs.envClasses.getCheckedValues();
        this.setState({filters: currentFilters});
    },

    checkKeyboard: function(e) {
      if( e.keyCode == 13 ) {
          this.updateFilters();
      }
    },

    updateFilters: function () {
        var filters = _.clone(this.state.filters);
        var appFilter = this.state.applicationInput.toLowerCase();
        var envFilter = this.state.environmentInput.toLowerCase();
        if (appFilter) {
            filters.application = appFilter.split(',');
        }

        if (envFilter) {
            filters.environment = envFilter.split(',');
        }

        this.setState({filters: filters});
        this.replaceWith('matrix', {}, {apps: appFilter, envs: envFilter})
    },

    applyFilters: function () {
        console.log(this.state.filters);
        _.mixin({
            'regexpMatchByValues': function (collection, property, filters) {
                if (!filters || filters.length === 0) {
                    return collection;
                }
                return _.filter(collection, function (item) {
                    var match = false;
                    for (var i = 0; i < filters.length; i++) {
                        var filterPattern = new RegExp('\\b' + filters[i].trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b');
                        if (item[property].toLocaleLowerCase().search(filterPattern) > -1) {
                            match = true;
                        }
                    }
                    return match;
                })
            }
        });

        var filters = this.state.filters;
        var lastDeployedFilter = this.state.lastDeployedFilter;

        var filteredJsonData = this.state.jsonData;
        if (filters) {
            _.keys(filters).forEach(function (key) {
                filteredJsonData = _.regexpMatchByValues(filteredJsonData, key, filters[key]);
            })
        }

        if(lastDeployedFilter) {
            var timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
            var matches = lastDeployedFilter.match(timespanPattern);
            var quantity = matches[1];
            var timeUnit = matches[2];
            var deployedDateBackInTime = moment().subtract(quantity, timeUnit);
            filteredJsonData = filteredJsonData.filter(function(elem) {
                return elem.momentTimestamp.isAfter(deployedDateBackInTime);
            });
        }

        return util.buildVersionMatrix(filteredJsonData, this.state.inverseTable);
    },

    clear: function () {
        this.setState({applicationInput: '', environmentInput: '', filters: _.clone(this.defaultFilter)});
        this.replaceWith('matrix');
    },

    inverseTable: function (clickedElement) {
        this.setState({inverseTable: clickedElement.target.checked})
    },

    updateTimeFilter: function(selected) {
        this.setState({lastDeployedFilter: selected});
    },

    hasEnvClass: function (envClass) {
        return this.state.filters.environmentClass.indexOf(envClass) > -1
    },

    setApplicationInput: function(newInput) {
        this.setState({applicationInput: newInput.target.value})
    },

    setEnvironmentInput: function(newInput) {
        this.setState({environmentInput: newInput.target.value})
    },

    render: function () {
        var filteredData = this.applyFilters();
        //var filtereData = this.state.filteredJsonData;
        var headers = filteredData.header || [];
        var body = filteredData.body || [];

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        {this.createInputFilter('applications', this.state.applicationInput, this.setApplicationInput)}&nbsp;
                                        {this.createInputFilter('environments', this.state.environmentInput, this.setEnvironmentInput)}
                                        <Button bsSize="small" onClick={this.updateFilters}>
                                            <i className="fa fa-filter"></i>&nbsp;apply
                                        </Button>
                                        <Button bsSize="small" bsStyle="danger" onClick={this.clear}>
                                            <i className="fa fa-trash"></i>
                                            &nbsp;clear all filters
                                        </Button>
                                    </div>

                                    <ButtonToolbar className="pull-right">
                                            <ButtonGroup data-toggle="buttons">
                                                <ToggleButton label='inverse'
                                                              tooltip="swap environments and applications"
                                                              checked={this.state.inverseTable}
                                                              onChange={this.inverseTable}
                                                              iconClassName={["fa fa-level-down fa-flip-horizontal", "fa fa-level-up"]}/>
                                            </ButtonGroup>
                                            <LastDeploymentDropdown selected={this.state.lastDeployedFilter} onSelect={this.updateTimeFilter} />
                                            <ToggleButtonGroup name="envClasses" ref="envClasses"
                                                               onChange={this.setEnvironmentClassFilters}
                                                               value={this.state.filters.environmentClass}>
                                                <ToggleButton label='u' tooltip="show/hide development environments"
                                                              value="u"/>
                                                <ToggleButton label='t' tooltip="show/hide test environments"
                                                              value="t"/>
                                                <ToggleButton label='q' tooltip="show/hide q environments"
                                                              value="q"/>
                                                <ToggleButton label='p' tooltip="show/hide production" value="p"/>
                                            </ToggleButtonGroup>
                                    </ButtonToolbar>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <VersionTable key="tablekey" tableHeader={headers} tableBody={body}
                              inverseTable={this.state.inverseTable}/>
                {<h3>
                    <i className={this.spinnerClasses()}></i>
                </h3>}
            </div >
        )
    },

    createInputFilter: function (labelText, value, onChangeHandler) {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">{labelText}</div>
                    <Input type="text" bsSize="small" onChange={onChangeHandler} onKeyDown={this.checkKeyboard}  value={value}></Input>
                </div>
            </div>
        )
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