var $ = jQuery = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var React = require('react');
var State = require('react-router').State;
var Navigation = require('react-router').Navigation;
var Link = require('react-router').Link;
var classString = require('react-classset');
var util = require('../vera-parser');
//var VersionTable = require('./versiontable.jsx');
//var LastDeploymentDropdown = require('./last-deployment-dropdown.jsx');
//var ToggleButtonGroup = require('./toggle-button-group.jsx');
//var ToggleButton = require('./toggle-button.jsx');
//var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
//var ButtonGroup = require('react-bootstrap').ButtonGroup;
//var FormGroup = require('react-bootstrap').FormGroup;
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;

module.exports = VersionMatrix = React.createClass({

    getInitialState: function () {
        var baseEnv = this.getQueryParam('base');
        var envsToCompare = this.getQueryParam('comparewith');

        return {
            baseEnvInput: baseEnv,
            envsToCompareInput: envsToCompare,
            loaded: false,
            diffResult: []
        }
    },

    mixins: [State, Navigation],

    //shouldComponentUpdate: function (nextProps, nextState) {
    //    return nextState.jsonData.length > 0;
    //},


    //componentWillMount: function() {
    //    $.getJSON('/api/v1/deploylog?onlyLatest=true&filterUndeployed=true').done(function (data) {
    //
    //        var enrichedLogEvents = _.map(data, function (logEvent) {
    //            logEvent.momentTimestamp = moment(logEvent.deployed_timestamp);
    //            if (isDeployedLast24Hrs(logEvent, moment().subtract(24, 'hours'))) {
    //                logEvent.newDeployment = true;
    //                return logEvent;
    //            }
    //
    //            return logEvent;
    //        });
    //        this.setState({jsonData: enrichedLogEvents, loaded: true});
    //
    //    }.bind(this));
    //
    //    var isDeployedLast24Hrs = function (logEvent, deployDateBackInTime) {
    //        return logEvent.momentTimestamp.isAfter(deployDateBackInTime);
    //    };
    //},

    //componentDidUpdate: function(nextProps, nextState) {
    //    var currentFilter = this.state.filters;
    //    var nextFilter = nextState.filters;
    //
    //    var currentTimeFilter = this.state.lastDeployedFilter;
    //    var nextTimeFilter = nextState.lastDeployedFilter;
    //
    //    var currentInverseTable = this.state.inverseTable;
    //    var nextInverseTable = nextState.inverseTable
    //
    //    var currentJsonData = this.state.jsonData
    //    var nextJsonData = nextState.jsonData;
    //
    //    if ((currentFilter !== nextFilter) || (currentTimeFilter !== nextTimeFilter) || (currentInverseTable !== nextInverseTable) || currentJsonData !== nextJsonData) {
    //        var filteredData = this.applyFilters();
    //        this.setState({filteredJsonData: filteredData});
    //    }
    //},


    setBaseEnvInput: function(newInput) {
        this.setState({baseEnvInput: newInput.target.value})
    },

    setEnvsToCompareInput: function(newInput) {
        this.setState({envsToCompareInput: newInput.target.value})
    },

    getQueryParam: function (paramName) {
        var queryParam = this.getQuery()[paramName];
        return queryParam || '';
    },

    diffEnvironments: function () {
        var queryParams = "?base=" + this.state.baseEnvInput + "&comparewith=" + this.state.envsToCompareInput
        $.getJSON('/api/v1/diff' + queryParams).done(function (data) {
            this.setState({diffResult: data, loaded:true})
        }.bind(this))
    },

    //componentWillReceiveProps: function (nextProps) {
    //    if (this.getQuery() != nextProps.query) {
    //        var filters = _.clone(this.state.filters)
    //        var apps = this.getQueryParam('apps');
    //        var envs = this.getQueryParam('envs');
    //        filters.application = apps.split(',');
    //        filters.environment = envs.split(',');
    //        this.setState({filters: filters, applicationInput: apps, environmentInput: envs})
    //    }
    //},

    checkKeyboard: function(e) {
      if( e.keyCode == 13 ) {
          this.diffEnvironments();
      }
    },

    //updateFilters: function () {
    //    var filters = _.clone(this.state.filters);
    //    var appFilter = this.state.applicationInput.toLowerCase();
    //    var envFilter = this.state.environmentInput.toLowerCase();
    //    if (appFilter) {
    //        filters.application = appFilter.split(',');
    //    }
    //
    //    if (envFilter) {
    //        filters.environment = envFilter.split(',');
    //    }
    //
    //    this.setState({filters: filters});
    //    this.replaceWith('matrix', {}, {apps: appFilter, envs: envFilter})
    //},

    render: function () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        {this.createInputFilter('base environment', this.state.baseEnv, this.setBaseEnvInput)}&nbsp;
                                        {this.createInputFilter('compare with', this.state.envsToCompare, this.setEnvsToCompareInput)}
                                        <Button bsSize="small" onClick={this.diffEnvironments}>
                                            <i className="fa fa-code-fork"></i>&nbsp;diff
                                        </Button>
                                        <Button bsSize="small" bsStyle="danger" onClick={this.clear}>
                                            <i className="fa fa-trash"></i>
                                            &nbsp;clear
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <table className="table table-bordered table-striped">
                {this.state.diffResult.map(function(elem) {
                    return <tbody><tr><td key={elem.application}>{elem.application}</td>{elem.environments.map(function(envs) {
                        return <td key={envs.environment}>{envs.environment}</td>
                        })}</tr></tbody>
                    })}
                </table>
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