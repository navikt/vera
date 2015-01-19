var React = require('react');
var $ = require('jquery');
var Router = require('react-router');
var Loader = require('react-loader');
var LogRow = require('./logrow.jsx');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            loaded: false,
            applicationFilter: '',
            environmentFilter: '',
            deployerFilter: '',
            versionFilter: '',
            timestampFilter: ''
        };
    },

    handleChange: function (e) {
        this.state[e.target.id] = e.target.value
        this.setState(this.state);
    },

    componentDidMount: function () {
        var queryParams = [];
        if (this.getQuery().app) {
            queryParams.push("app=" + this.getQuery().app);
            this.state.applicationFilter = this.getQuery().app;
        }

        if (this.getQuery().env) {
            queryParams.push("env=" + this.getQuery().env);
            this.state.environmentFilter = this.getQuery().env;
        }

        $.getJSON('http://localhost:9080/version?' + queryParams.join("&")).done(function (data) {
            this.setState({items: data, loaded: true})
        }.bind(this));
    },

    render: function () {
        var applicationFilter = this.state.applicationFilter.toLowerCase();
        var environmentFilter = this.state.environmentFilter.toLowerCase();
        var deployerFilter = this.state.deployerFilter.toLowerCase();
        var versionFilter = this.state.versionFilter.toLowerCase();
        var timestampFilter = this.state.timestampFilter.toLowerCase();

        var nonMatchingEvents = function (elem) {
            var application = elem.application;
            var environment = elem.environment;
            var deployer = elem.deployer;
            var version = elem.version;
            var timestamp = elem.timestamp;

            return application.toLowerCase().indexOf(applicationFilter) > -1
                && environment.toLowerCase().indexOf(environmentFilter) > -1
                && deployer.toLowerCase().indexOf(deployerFilter) > -1
                && version.toLowerCase().indexOf(versionFilter) > -1
                && timestamp.toString().toLowerCase().indexOf(timestampFilter) > -1;
        }

        var filteredEvents = this.state.items.filter(nonMatchingEvents);
        var eventsToRender = filteredEvents.slice(0, 50);

        return (
            <div>
                <h2>Events ({filteredEvents.length + "/" + this.state.items.length})</h2>
                <Loader loaded={this.state.loaded}>
                    <table className='table table-striped'>
                        <tr>
                            <th>
                                <input id="applicationFilter" placeholder="Application" value={this.state.applicationFilter} type="text" onChange={this.handleChange} />
                            </th>
                            <th>
                                <input id="environmentFilter" placeholder="Environment" value={this.state.environmentFilter} type="text" onChange={this.handleChange} />
                            </th>
                            <th>
                                <input id="deployerFilter" placeholder="Deployer" type="text" onChange={this.handleChange} />
                            </th>
                            <th>
                                <input id="versionFilter" placeholder="Version" type="text" onChange={this.handleChange} />
                            </th>
                            <th>
                                <input id="timestampFilter" placeholder="Timestamp" type="text" onChange={this.handleChange} />
                            </th>
                        </tr>
                        <tbody>
                        {eventsToRender
                            .map(function (elem) {
                                return <LogRow key={elem._id} event={elem} />
                            })}
                        </tbody>
                    </table>
                </Loader>
            </div>
        )
    }
});
