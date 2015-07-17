var $ = jQuery = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var React = require('react');
var Router = require('react-router');
var classString = require('react-classset');
var Link = Router.Link;
var util = require('../vera-parser');
var VersionTable = require('./versiontable.jsx');
var ToggleButtonGroup = require('./toggle-button-group.jsx');
var ToggleButton = require('./toggle-button.jsx');
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;

module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        var filters = {environmentClass: ['t', 'q', 'p']};

        filters.application = this.getQueryParam('apps');
        filters.environment = this.getQueryParam('envs');

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
                logEvent.momentTimestamp = moment(logEvent.deployed_timestamp);
                var ddbit = moment().subtract(24, 'hours');
                if (isDeployedLast24Hrs(logEvent, ddbit)) {
                    logEvent.newDeployment = true;
                    return logEvent;
                }

                return logEvent;
            });
            this.setState({jsonData: enrichedLogEvents});
        }.bind(this));

        var isDeployedLast24Hrs = function (logEvent, deployDateBackInTime) {
            return logEvent.momentTimestamp.isAfter(deployDateBackInTime);
        };
    },

    getQueryParam: function (paramName) {
        var queryParam = this.getQuery()[paramName];
        return (queryParam) ? queryParam.split(',') : [];
    },

    componentWillUpdate: function () {
        var filters = this.state.filters;
        delete filters.application;
        delete filters.environment;

        filters.application = this.getQueryParam('apps');
        filters.environment = this.getQueryParam('envs');
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
            filters.application = appFilter.split(',');
        }

        if (envFilter) {
            filters.environment = envFilter.split(',');
        }

        filters.environmentClass = this.refs.envClasses.getCheckedValues();
        this.setState({filters: filters});

        if (e.target.type === 'submit') { // prevent form submission, no need to call the server as everything happens client side
            e.preventDefault();
        }

        window.location.href = "#/matrix?envs=" + envFilter + "&apps=" + appFilter;
    },

    applyFilters: function () {

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
            const deployedDateBackInTime = moment().subtract(quantity, timeUnit);
            console.log(quantity + " " + timeUnit);
            filteredJsonData = filteredJsonData.filter(function(elem) {
                return elem.momentTimestamp.isAfter(deployedDateBackInTime);
            });
        }

        return util.buildVersionMatrix(filteredJsonData, this.state.inverseTable);
    },

    clear: function () {
        this.refs.environmentFilter.getDOMNode().value = '';
        this.refs.applicationFilter.getDOMNode().value = '';
        var currentFilters = this.state.filters;
        delete currentFilters.application;
        delete currentFilters.environment;
        //this.setState({filters: currentFilters});
        window.location.href = "#/matrix";
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

    render: function () {
        var appFilter = this.state.filters.application;
        var envFilter = this.state.filters.environment;
        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        var body = filteredData.body;

        var meg = this;

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
                                        <button type="submit" className="btn btn-default btn-sm"
                                                onClick={this.updateFilters}>
                                            <i className="fa fa-filter"></i>
                                            &nbsp;
                                            apply
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={this.clear}>
                                            <i className="fa fa-trash"></i>
                                            &nbsp;reset
                                        </button>
                                    </div>

                                    <ButtonToolbar className="pull-right">
                                        <ButtonGroup>
                                            <ToggleButtonGroup name="controls" onChange={this.inverseTable}>
                                                <ToggleButton label='inverse'
                                                              tooltip="swap environments and applications"
                                                              value="inverse"
                                                              checked={this.state.inverseTable}
                                                              iconClassName={["fa fa-level-down fa-flip-horizontal", "fa fa-level-up"]}/>
                                            </ToggleButtonGroup>
                                        </ButtonGroup>

                                        <ButtonGroup>
                                            <DropdownButton  className="btn-toggle"
                                                             onSelect={meg.updateTimeFilter}
                                                            title="in last" key="hei" bsSize="small">
                                                <MenuItem eventKey="1d">last 1 day</MenuItem>
                                                <MenuItem eventKey="2d">last 2 days</MenuItem>
                                                <MenuItem eventKey="3d">last 3 days</MenuItem>
                                                <MenuItem eventKey="4d">last 4 days</MenuItem>
                                                <MenuItem eventKey="5d">last 5 days</MenuItem>
                                                <MenuItem divider />
                                                <MenuItem eventKey="1w">last 1 week</MenuItem>
                                                <MenuItem eventKey="2w">last 2 weeks</MenuItem>
                                                <MenuItem eventKey="3w">last 3 weeks</MenuItem>
                                                <MenuItem divider />
                                                <MenuItem eventKey="1M">last 1 month</MenuItem>
                                                <MenuItem eventKey="2M">last 2 months</MenuItem>
                                                <MenuItem eventKey="3M">last 3 months</MenuItem>
                                                <MenuItem eventKey="4M">last 4 months</MenuItem>
                                                <MenuItem eventKey="5M">last 5 months</MenuItem>
                                                <MenuItem eventKey="6M">last 6 months</MenuItem>
                                                <MenuItem divider />
                                                <MenuItem eventKey="1y">last 1 year</MenuItem>
                                                <MenuItem eventKey="2y">last 2 years</MenuItem>
                                                <MenuItem eventKey="3y">last 3 years</MenuItem>
                                                <MenuItem divider />
                                                <MenuItem eventKey="">beginning of time</MenuItem>
                                            </DropdownButton>
                                        </ButtonGroup>

                                        <ButtonGroup>
                                            <ToggleButtonGroup name="envClasses" ref="envClasses"
                                                               onChange={this.updateFilters}
                                                               value={this.state.filters.environmentClass}>
                                                <ToggleButton label='u' tooltip="show only development environments"
                                                              value="u"/>
                                                <ToggleButton label='t' tooltip="show only test environments"
                                                              value="t"/>
                                                <ToggleButton label='q' tooltip="show only q environments"
                                                              value="q"/>
                                                <ToggleButton label='p' tooltip="show only production" value="p"/>
                                            </ToggleButtonGroup>
                                        </ButtonGroup>
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

    createInputFilter: function (labelText, inputId, defaultValue) {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">{labelText}</div>
                    <input ref={inputId} type="text" className="form-control input-sm"
                           defaultValue={defaultValue}></input>
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