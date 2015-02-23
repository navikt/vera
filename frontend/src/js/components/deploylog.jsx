var React = require('react/addons');
var $ = require('jquery');
var moment = require('moment');
var Router = require('react-router');
var LogRow = require('./logrow.jsx');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            loaded: false,
            itemRenderCount: 50,
            applicationFilter: '',
            environmentFilter: '',
            deployerFilter: '',
            versionFilter: '',
            deployedTimestampFilter: '',
            onlyCurrentVersions: false
        };
    },

    handleChange: function (e) {
        this.state[e.target.id] = e.target.value
        this.setState(this.state);
    },

    componentDidMount: function () {
        var queryParams = [];

        var appQueryParam = this.getQuery().app;
        if (appQueryParam) {
            queryParams.push("app=" + appQueryParam);
            this.setState({applicationFilter: appQueryParam});
        }

        var envQueryParam = this.getQuery().env;
        if (envQueryParam) {
            queryParams.push("env=" + envQueryParam);
            this.setState({environmentFilter: envQueryParam});
        }

        $.getJSON('/version?last=1month').done(function (data) {
            this.setState({items: data})
            $.getJSON('/version?' + queryParams.join("&")).done(function (data) {
                this.setState({items: data, loaded: true})
            }.bind(this));
        }.bind(this));

    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
    },

    toggleCurrentVersionFilter: function () {
        this.setState({onlyCurrentVersions: !this.state.onlyCurrentVersions});
    },

    render: function () {
        var tableHeaderFilter = function (elem) {
            return elem.application.toLowerCase().indexOf(this.state.applicationFilter.toLowerCase()) > -1
                && elem.environment.toLowerCase().indexOf(this.state.environmentFilter.toLowerCase()) > -1
                && elem.deployer.toLowerCase().indexOf(this.state.deployerFilter.toLowerCase()) > -1
                && elem.version.toLowerCase().indexOf(this.state.versionFilter.toLowerCase()) > -1
                && elem.deployed_timestamp.toString().toLowerCase().indexOf(this.state.deployedTimestampFilter.toLowerCase()) > -1;
        }.bind(this)

        var inactiveVersionsIfEnabled = function (elem) {
            if (!this.state.onlyCurrentVersions) {
                return true;
            } else {
                return elem.replaced_timestamp === "";
            }
        }.bind(this);

        var toReadableDateFormat = function (event) {
            event.deployed_timestamp = moment(event.deployed_timestamp).format('DD-MM-YY HH:mm:ss');
            return event;
        };

        var filteredEvents = this.state.items.filter(tableHeaderFilter).filter(inactiveVersionsIfEnabled).map(toReadableDateFormat);
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);
        var cx = React.addons.classSet;

        var spinnerClasses = cx({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        });

        var currentVersionToggleClasses = cx({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            "active": this.state.onlyCurrentVersions
        });

        return (
            <div className="container">
                        <h2>events
                            <small> {filteredEvents.length + "/" + this.state.items.length} <i className={spinnerClasses}></i></small>
                            <div className="pull-right" data-toggle="buttons" role="group">
                                <label className={currentVersionToggleClasses} >
                                    <input type="checkbox" autoComplete="off" onClick={this.toggleCurrentVersionFilter} />
                                Show only latest
                                </label>
                            </div>
                        </h2>

                <table className='table table-bordered table-striped'>
                    <tr>
                        <th>
                            <input id="applicationFilter" className="form-control" placeholder="application" value={this.state.applicationFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="environmentFilter" className="form-control" placeholder="environment" value={this.state.environmentFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployerFilter" className="form-control" placeholder="deployer" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="versionFilter" className="form-control" placeholder="version" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployedTimestampFilter" className="form-control" placeholder="deployed" type="text" onChange={this.handleChange} />
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
    }
});




