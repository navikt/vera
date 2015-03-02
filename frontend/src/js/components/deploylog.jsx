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
            onlyCurrentVersions: false,
            filters: this.enrichFromObject(this.emptyFilters, this.getQuery())
        };
    },

    componentDidMount: function () {
        $.getJSON('/version?last=1month').done(function (data) {
            this.setState({items: data.map(this.toReadableDateFormat)})
            $.getJSON('/version').done(function (data) {
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
                    <div className="pull-right" data-toggle="buttons" role="group">
                        <label className="btn btn-default btn-sm" >
                            <input type="checkbox" autoComplete="off" onClick={this.clearFilters} />
                        clear filters
                        </label>
                        <label className={this.currentToggleButtonClasses()} >
                            <input type="checkbox" autoComplete="off" onClick={this.toggleCurrentVersionFilter} />
                        show only latest
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
        timestamp: ''
    },

    tableHeaderFilter: function (elem) {
        return elem.application.toLowerCase().indexOf(this.state.filters.application.toLowerCase()) > -1
            && elem.environment.toLowerCase().indexOf(this.state.filters.environment.toLowerCase()) > -1
            && elem.deployer.toLowerCase().indexOf(this.state.filters.deployer.toLowerCase()) > -1
            && elem.version.toLowerCase().indexOf(this.state.filters.version.toLowerCase()) > -1
            && elem.deployed_timestamp.toString().toLowerCase().indexOf(this.state.filters.timestamp.toLowerCase()) > -1;
    },

    inactiveVersionsIfEnabled: function (elem) {
        if (!this.state.onlyCurrentVersions) {
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

    toReadableDateFormat: function (eventItem) {
        eventItem.deployed_timestamp = moment(eventItem.deployed_timestamp).format("DD-MM-YY HH:mm:ss");
        return eventItem;
    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
    },

    clearFilters: function () {
        this.setState({filters: _.clone(this.emptyFilters), onlyCurrentVersions: false});
    },

    toggleCurrentVersionFilter: function () {
        this.setState({onlyCurrentVersions: !this.state.onlyCurrentVersions});
    },

    spinnerClasses: function () {
        return classString({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        })
    },

    currentToggleButtonClasses: function () {
        return classString({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            "active": this.state.onlyCurrentVersions
        })
    }
});