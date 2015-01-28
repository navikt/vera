var React = require('react/addons');
var $ = require('jquery');
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

        $.getJSON('/version?last=6month').done(function (data) {
            this.setState({items: data})
            $.getJSON('/version?' + queryParams.join("&")).done(function (data) {
                this.setState({items: data, loaded: true})
            }.bind(this));
        }.bind(this));

    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
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
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);
        var cx = React.addons.classSet;
        var spinnerClasses = cx({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        });

        return (
            <div className="container">
                <h2>events <small>{filteredEvents.length + "/" + this.state.items.length} <i className={spinnerClasses}></i></small></h2>
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
                                <input id="timestampFilter" className="form-control" placeholder="timestamp" type="text" onChange={this.handleChange} />
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
