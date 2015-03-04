var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Router = require('react-router');
var LogRow = require('./logrow.jsx');
var classString = require('react-classset');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            loaded: false,
            itemRenderCount: 50,
            filters: this.enrichFromObject(this.emptyFilters, this.getQuery())
        };
    },

    componentDidMount: function () {
        var urlContainsValidBackendParams = this.extractFromObject(this.validBackendParams, this.getQuery()).length > 0;

        var initialBackendParams = '';

        if (urlContainsValidBackendParams){
            var extractedValidParams = _.pick(this.getQuery(), this.validBackendParams);
            initialBackendParams = this.serialize(extractedValidParams);
        } else {
            initialBackendParams = '?last=1month';
        }

        $.getJSON(this.DEPLOYLOG_SERVICE + initialBackendParams).done(function (data) {
            this.setState({items: data.map(this.toReadableDateFormat)})
            $.getJSON(this.DEPLOYLOG_SERVICE).done(function (data) {
                this.setState({
                    items: data.map(this.toReadableDateFormat), loaded: true
                })
            }.bind(this));
        }.bind(this));
    },

    render: function () {
        var filteredEvents = this.state.items.filter(this.tableHeaderFilter).filter(this.inactiveVersionsIfEnabled);
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);

        return (
            <div className="container">
                <h2>events
                    <small> {filteredEvents.length + "/" + this.state.items.length}
                        <i className={this.spinnerClasses()}></i>
                    </small>
                    <div className="pull-right btn-toolbar" data-toggle="buttons" role="group">
                            <button type="button"  className="btn btn-default btn-sm" onClick={this.clearFilters} ><i className="fa fa-trash"></i> clear</button>
                        <label className={this.currentToggleButtonClasses()}>
                            <input type="checkbox" autoComplete="off" onClick={this.toggleOnlyLatest} />
                            <i className="fa fa-asterisk"></i> show only latest
                        </label>
                    </div>
                </h2>

                <table className='table table-bordered table-striped'>
                    <tr>
                        <th>
                            <input id="application" type="text" className="form-control input-sm" placeholder="application" value={this.state.filters.application}  onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="environment" type="text" className="form-control input-sm" placeholder="environment" value={this.state.filters.environment}  onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployer" type="text" className="form-control input-sm" placeholder="deployer" value={this.state.filters.deployer}  onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="version" type="text" className="form-control input-sm" placeholder="version" value={this.state.filters.version}  onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="timestamp" type="text" className="form-control input-sm" placeholder="timestamp"  value={this.state.filters.timestamp}  onChange={this.handleChange} />
                        </th>
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
        onlyLatest: false
    },

    validBackendParams: ["application", "environment", "deployer", "version", "onlyLatest"],

    DEPLOYLOG_SERVICE: '/api/v1/deploylog',

    tableHeaderFilter: function (elem) {
        return elem.application.toLowerCase().indexOf(this.state.filters.application.toLowerCase()) > -1
            && elem.environment.toLowerCase().indexOf(this.state.filters.environment.toLowerCase()) > -1
            && elem.deployer.toLowerCase().indexOf(this.state.filters.deployer.toLowerCase()) > -1
            && elem.version.toLowerCase().indexOf(this.state.filters.version.toLowerCase()) > -1
            && elem.deployed_timestamp.toString().toLowerCase().indexOf(this.state.filters.timestamp.toLowerCase()) > -1;
    },

    serialize: function (obj) {
        return '?' + Object.keys(obj).reduce(function (a, k) {
                a.push(k + '=' + encodeURIComponent(obj[k]));
                return a;
            }, []).join('&')
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

    enrichFromObject: function (base, object) {
        var enrichedObject = {};
        Object.keys(base).forEach(function (key) {
            enrichedObject[key] = object[key] ? object[key] : '';
        });
        return enrichedObject;
    },

    extractFromObject: function (values, object) {
        return Object.keys(object).filter(function (val) {
            return values.indexOf(val) > -1;
        });
    },

    toReadableDateFormat: function (eventItem) {
        eventItem.deployed_timestamp = moment(eventItem.deployed_timestamp).format("DD-MM-YY HH:mm:ss");
        return eventItem;
    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
    },

    clearFilters: function () {
        this.setState({filters: _.clone(this.emptyFilters)});
    },

    toggleOnlyLatest: function () {
        console.log("asd");
        var filter = _.clone(this.state.filters, true);
        filter['onlyLatest'] = !this.state.filters.onlyLatest;
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

    currentToggleButtonClasses: function () {
        return classString({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            "active": this.state.filters.onlyLatest
        })
    }
});