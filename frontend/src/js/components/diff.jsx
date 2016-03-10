var $ = jQuery = require('jquery');
var React = require('react');
var State = require('react-router').State;
var Navigation = require('react-router').Navigation;
var classString = require('react-classset');
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var DiffTable = require('./diff-table.jsx');
var Immutable = require('immutable');
var _ = require('lodash');

var ENTER_KEY = 13;

module.exports = Diff = React.createClass({

    mixins: [State, Navigation],

    getInitialState: function () {
        var baseEnv = this.getQueryParam('base');
        var envsToCompare = this.getQueryParam('comparewith');

        return {
            baseEnvironment: baseEnv,
            environmentsToCompare: envsToCompare,
            baseEnvInput: baseEnv,
            envsToCompareInput: envsToCompare,
            loading: false,
            diffResult: [],
            errors: []
        }
    },

    componentWillReceiveProps: function (nextProps) {
        var baseEnv = this.getQueryParam('base');
        var envsToCompare = this.getQueryParam('comparewith');

        this.setState({
            baseEnvironment: baseEnv,
            baseEnvInput: baseEnv,
            environmentsToCompare: envsToCompare,
            envsToCompareInput: envsToCompare
        })
    },

    componentDidMount: function () {
      this.refs.base.getInputDOMNode().focus();
    },

    componentDidUpdate: function (prevProps, prevState) {
        var currentBaseEnv = this.state.baseEnvironment;
        var currentEnvsToCompare = this.state.environmentsToCompare;

        if (currentBaseEnv !== prevState.baseEnvironment || currentEnvsToCompare !== prevState.environmentsToCompare) {
            if (this.isInputValid()) {
                this.callBackendDiffService();
            }
        }
    },

    componentWillMount: function () {
        if (this.state.baseEnvInput || this.state.envsToCompareInput) {
            if (this.isInputValid()) {
                this.callBackendDiffService();
            }
        }
    },

    getEnvironments: function () {
        if (this.state.baseEnvironment && this.state.environmentsToCompare) {
            return [this.state.baseEnvironment].concat(this.state.environmentsToCompare);
        }
        return [];
    },

    setBaseEnvInput: function (newInput) {
        this.setState({baseEnvInput: newInput.target.value})
    },

    setEnvsToCompareInput: function (newInput) {
        this.setState({envsToCompareInput: _.map(newInput.target.value.split(','), _.trim)})
    },

    getQueryParam: function (paramName) {
        var queryParam = this.getQuery()[paramName];
        return queryParam || '';
    },

    setEnvironmentsToDiff: function() {
        this.setState({
            baseEnvironment: this.state.baseEnvInput,
            environmentsToCompare: this.state.envsToCompareInput
        });
        this.replaceWith('diff', {}, {base: this.state.baseEnvInput, comparewith: this.state.envsToCompareInput})
    },

    isInputValid: function () {
        var errors = [];
        if (!this.state.baseEnvironment) {
            errors.push("Base environment you to compare other environments with is required")
        }
        if (this.state.baseEnvironment && this.state.baseEnvironment.split(',').length > 1) {
            errors.push("Only one environment can be base environment, please don't use comma separated calues here");
        }
        if (!this.state.environmentsToCompare) {
            errors.push("One ore more environments (comma separated) you want to compare with base environment are required")
        }

        this.setState({errors: errors});
        return errors.length === 0;
    },


    callBackendDiffService: function () {
        this.setState({loading: true})

        var queryParams = "?base=" + this.state.baseEnvironment + "&comparewith=" + this.state.environmentsToCompare.join(',')
        $.getJSON('/api/v1/diff' + queryParams).done(function (data) {
            this.setState({diffResult: Immutable.List(data).toArray(), loading: false})
        }.bind(this))
    },

    checkKeyboard: function (e) {
        if (e.keyCode == ENTER_KEY) {
            this.setEnvironmentsToDiff();
        }
    },

    render: function () {
        return (
            <div className="container-fluid">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <form className="form-inline">
                            <div>
                                <div className="form-group">
                                    {this.createInputFilter('base environment', this.state.baseEnvInput, this.setBaseEnvInput, 'base')}&nbsp;
                                    {this.createInputFilter('compare with', this.state.envsToCompareInput, this.setEnvsToCompareInput, 'compare')}

                                    <Button bsSize="small" onClick={this.setEnvironmentsToDiff}>
                                        <i className="fa fa-code-fork"></i>&nbsp;diff
                                    </Button>
                                </div>
                                <div className="pull-right">
                                    <i className="fa fa-info-circle fa-lg logo"></i>&nbsp;< a href="http://confluence.adeo.no/x/Ljk9Cg" target="_blank">vera's take on version numbers</a>
                                </div>
                            </div>

                        </form>

                        <div className={this.feedbackClasses()}>
                            {this.state.errors.map(function(error) {
                                return (<p><i
                                    className="fa fa-exclamation-circle fa-lg text-danger"></i>&nbsp;{error}
                                </p>)
                                })}
                        </div>
                    </div>
                </div>
                <DiffTable environments={this.getEnvironments()} diffResult={this.state.diffResult} baseEnvironment={this.state.baseEnvironment}/>
                <h3><i className={this.spinnerClasses()}></i></h3>
            </div >
        )
    },

    createInputFilter: function (labelText, value, onChangeHandler, ref) {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">{labelText}</div>
                    <Input ref={ref} type="text" bsSize="small" onChange={onChangeHandler} onKeyDown={this.checkKeyboard}
                           value={value} focus={focus}></Input>
                </div>
            </div>
        )
    },

    feedbackClasses: function () {
        return classString({
            'feedback': true,
            'hidden': this.state.errors.length === 0
        })
    },

    spinnerClasses: function () {
        return classString({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': !this.state.loading
        })
    }
});