var _ = require('lodash');
var React = require('react');
var uuid = require('node-uuid');
var classString = require('react-classset');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;

var BASE = "BASE";
var BEHIND = -1;
var AHEAD = 1;
var EQUAL = 0;
var UNKNOWN = "UNKNOWN";
var MISSING = "MISSING";

var sortOrder = [BEHIND, MISSING, UNKNOWN, AHEAD, EQUAL, BASE];

module.exports = DiffTable = React.createClass({

    shouldComponentUpdate: function (nextProps) {
        return nextProps.diffResult !== this.props.diffResult;
    },

    sortByDiffResult: function (elem) {
        var that = this;
        return _.reduce(elem.environments, function (result, value) {
            var index = _.indexOf(sortOrder, that.getDiffResult(value))
            result = index < result ? index : result;
            return result;

        }, sortOrder.length)
    },

    buildTableBody: function () {
        return _.chain(this.props.diffResult).
            sortByOrder([this.sortByDiffResult, 'application'], ['asc', 'asc'])
            .map(function (elem) {
                return <tr key={uuid.v1()} className={this.noDiff(elem)}>
                    <td key={elem.application}>{elem.application}</td>
                    {this.tableRow(elem)}
                </tr>
            }.bind(this)).
            value()
    },

    noDiff: function (eventsForApp) {
        function allEqual(results) {
            var equalAppsCount = results.filter(function (diffResult) {
                return diffResult.diffToBase === EQUAL
            }).length

            return equalAppsCount === results.length;
        }

        return classString({
            'success': allEqual(eventsForApp.environments)
        });
    },

    tableRow: function (eventsForApp) {
        var self = this;

        function generateTooltip(diffResult) {
            return (
                <Tooltip>
                    <div>{self.tooltipText(diffResult)}</div>
                </Tooltip>
            )
        }

        return this.props.environments.map(function (env) {
            var event = _.chain(eventsForApp.environments).filter(function (e) {
                return e.environment === env
            }).head().value();
            var version = (event.event) ? event.event.version : "-"
            return (
                <OverlayTrigger key={uuid.v1()} placement="left" overlay={generateTooltip(self.getDiffResult(event))}>
                    <td className='text-nowrap'>
                        <div>
                            <i className={self.diffIcon(event)}></i>
                            &nbsp;{version}
                        </div>
                    </td>
                </OverlayTrigger>
            )
        })
    },

    buildTable: function () {
        if (this.props.diffResult.length > 0) {
            return (

                <table className="table table-bordered table-striped table-hover">
                    <thead>
                    <tr>
                        <th>applications</th>
                        {this.props.environments.map(function(elem) {
                            return <th key={elem}>{elem}</th>})}
                    </tr>
                    </thead>
                    <tbody>
                    {this.buildTableBody()}
                    </tbody>
                </table>
            )
        }
    },

    render: function () {
        return (
            <div className="container-fluid">
                {this.buildTable()}
            </div >
        )
    },

    diffIcon: function (diffResult) {
        var result = this.getDiffResult(diffResult)
        return classString({
            'fa': result !== BASE,
            'fa-arrow-down': result === AHEAD,
            'fa-arrow-up': _.includes([BEHIND, MISSING], result),
            'fa-check': result === EQUAL,
            'fa-question': result === UNKNOWN,
            'text-success': result === EQUAL,
            'text-warning': result === AHEAD,
            'text-danger': _.includes([BEHIND, MISSING], result),
            'text-info': result === UNKNOWN,
            'fa-lg': true
        })
    },

    getDiffResult: function (something) {
        if (something.isBaseEnvironment) {
            return BASE;
        } else if (_.isNumber(something.diffToBase)) {
            return something.diffToBase;
        } else if (!something.event) {
            return MISSING
        }

        return UNKNOWN;
    },

    tooltipText: function (diffResult) {
        switch (diffResult) {
            case BEHIND:
                return "version is behind " + this.props.baseEnvironment
            case MISSING:
                return "not deployed"
            case UNKNOWN:
                return "unable to make sense of version number"
            case AHEAD:
                return "version is ahead of " + this.props.baseEnvironment
            case EQUAL:
                return "same version as " + this.props.baseEnvironment
            case BASE:
                return "base version other versions on this row are compared to"
        }
    }
});